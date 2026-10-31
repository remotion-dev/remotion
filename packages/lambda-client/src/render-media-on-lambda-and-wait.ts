import {
	InvokeWithResponseStreamCommand,
	type InvokeWithResponseStreamResponseEvent,
} from '@aws-sdk/client-lambda';
import {makeStreamer} from '@remotion/streaming';
import {getLambdaClient} from './aws-clients';
import type {RenderProgress} from './constants';
import {getRenderProgress} from './get-render-progress';
import {
	makeLambdaRenderMediaPayload,
	type InnerRenderMediaOnLambdaInput,
} from './make-lambda-payload';
import {parseFunctionName} from './parse-function-name';
import {
	internalRenderMediaOnLambdaRaw,
	renderMediaOnLambdaOptionalToRequired,
	validateRenderMediaOnLambdaInput,
	type RenderMediaOnLambdaInput,
	type RenderMediaOnLambdaOutput,
} from './render-media-on-lambda';
import {getRendererFunctionTransport} from './renderer-transport';
import {
	messageTypeIdToMessageType,
	type MessageTypeId,
	type StreamingPayload,
} from './streaming/streaming';

export type RenderMediaOnLambdaAndWaitInput = RenderMediaOnLambdaInput & {
	onInit?: (render: RenderMediaOnLambdaOutput) => void | Promise<void>;
	onProgress?: (progress: RenderProgress) => void | Promise<void>;
};

export type RenderMediaOnLambdaAndWaitOutput = RenderProgress & {
	done: true;
	outputFile: string;
	outKey: string;
	outBucket: string;
};

export class RenderMediaOnLambdaAndWaitError extends Error {
	readonly renderId: string | null;
	readonly bucketName: string | null;
	readonly render: RenderMediaOnLambdaOutput | null;
	readonly progress: RenderProgress | null;
	readonly cause: unknown;
	readonly startupOutcome: 'indeterminate' | 'started' | 'failed';

	constructor({
		message,
		render,
		progress,
		cause,
		startupOutcome,
	}: {
		message: string;
		render: RenderMediaOnLambdaOutput | null;
		progress: RenderProgress | null;
		cause: unknown;
		startupOutcome: 'indeterminate' | 'started' | 'failed';
	}) {
		super(message);
		this.name = 'RenderMediaOnLambdaAndWaitError';
		this.render = render;
		this.renderId = render?.renderId ?? null;
		this.bucketName = render?.bucketName ?? null;
		this.progress = progress;
		this.cause = cause;
		this.startupOutcome = startupOutcome;
	}
}

export const internalRenderMediaOnLambdaAndWait = async (
	input: InnerRenderMediaOnLambdaInput,
	callbacks: {
		onInit: NonNullable<RenderMediaOnLambdaAndWaitInput['onInit']> | null;
		onProgress: NonNullable<
			RenderMediaOnLambdaAndWaitInput['onProgress']
		> | null;
	},
): Promise<RenderMediaOnLambdaAndWaitOutput> => {
	let render: RenderMediaOnLambdaOutput | null = null;
	let progress: RenderProgress | null = null;
	const functionTimeout =
		(parseFunctionName(input.functionName)?.timeoutInSeconds ?? 900) * 1000;
	let deadline = Date.now() + functionTimeout * 2 + 20000;

	const failure = (
		message: string,
		cause: unknown,
		startupOutcome: 'indeterminate' | 'started' | 'failed',
	) =>
		new RenderMediaOnLambdaAndWaitError({
			message,
			render,
			progress,
			cause,
			startupOutcome,
		});
	const initialized = async (value: RenderMediaOnLambdaOutput) => {
		if (render) {
			throw failure('Received duplicate startup metadata', null, 'started');
		}

		render = value;
		try {
			await callbacks.onInit?.(value);
		} catch (err) {
			throw failure(
				`onInit callback failed: ${err instanceof Error ? err.message : String(err)}`,
				err,
				'started',
			);
		}
	};

	const updated = async (value: RenderProgress) => {
		progress = value;
		// Leave enough time for storage-based recovery on the asynchronous polling path.
		deadline = value.timeoutTimestamp + functionTimeout + 20000;
		try {
			await callbacks.onProgress?.(value);
		} catch (err) {
			throw failure(
				`onProgress callback failed: ${err instanceof Error ? err.message : String(err)}`,
				err,
				'started',
			);
		}

		if (value.fatalErrorEncountered) {
			throw failure(
				value.errors.find((e) => e.isFatal && !e.willRetry)?.message ??
					'Lambda render failed',
				null,
				'started',
			);
		}

		if (value.done) {
			if (!value.outputFile || !value.outKey || !value.outBucket) {
				throw failure(
					'Render finished without output metadata',
					null,
					'started',
				);
			}

			return value as RenderMediaOnLambdaAndWaitOutput;
		}

		return null;
	};

	if (getRendererFunctionTransport(input.region) === 's3') {
		await initialized(await internalRenderMediaOnLambdaRaw(input));
	} else {
		// Build and validate before invoking. Never retry start: its outcome may be unknown.
		const payload = await makeLambdaRenderMediaPayload(input);
		const controller = new AbortController();
		let iterator: AsyncIterator<InvokeWithResponseStreamResponseEvent> | null =
			null;
		let pendingMessages: StreamingPayload[] = [];
		const streamer = makeStreamer((_status, id, data) => {
			pendingMessages.push({
				type: messageTypeIdToMessageType(id as MessageTypeId),
				payload: JSON.parse(new TextDecoder().decode(data)),
			} as StreamingPayload);
		});
		const nextOrTimeout = async <T>(promise: Promise<T>): Promise<T> => {
			let timer: ReturnType<typeof setTimeout> | null = null;
			try {
				return await Promise.race([
					promise,
					new Promise<never>((_resolve, reject) => {
						timer = setTimeout(
							() => reject(new Error('Lambda progress stream stalled')),
							Math.max(1, Math.min(30000, deadline - Date.now())),
						);
					}),
				]);
			} finally {
				if (timer) {
					clearTimeout(timer);
				}
			}
		};

		try {
			const response = await nextOrTimeout(
				getLambdaClient(
					input.region,
					functionTimeout,
					input.requestHandler,
				).send(
					new InvokeWithResponseStreamCommand({
						FunctionName: input.functionName,
						InvocationType: 'RequestResponse',
						Payload: JSON.stringify({...payload, streamProgress: true}),
					}),
					{abortSignal: controller.signal},
				),
			);
			if (!response.EventStream) {
				throw new Error('Lambda returned no progress stream');
			}

			iterator = response.EventStream[Symbol.asyncIterator]();
			while (true) {
				const event = await nextOrTimeout(iterator.next());
				if (event.done) {
					break;
				}

				if (event.value.PayloadChunk?.Payload) {
					await streamer.onData(event.value.PayloadChunk.Payload);
					const messages = pendingMessages;
					pendingMessages = [];
					for (const message of messages) {
						if (message.type === 'render-started') {
							await initialized(message.payload);
						} else if (message.type === 'render-failed') {
							if (message.payload.progress) {
								await updated(message.payload.progress);
							}

							throw failure(
								message.payload.message,
								message.payload.stack,
								render ? 'started' : 'failed',
							);
						} else if (
							message.type === 'render-progress' ||
							message.type === 'render-complete'
						) {
							if (!render) {
								throw new Error('Received progress before render identity');
							}

							const result = await updated(message.payload);
							if (message.type === 'render-complete' && result) {
								return result;
							}
						}
					}
				}

				if (event.value.InvokeComplete?.ErrorCode) {
					throw new Error(
						`${event.value.InvokeComplete.ErrorCode}: ${event.value.InvokeComplete.ErrorDetails}`,
					);
				}
			}
		} catch (err) {
			if (err instanceof RenderMediaOnLambdaAndWaitError) {
				throw err;
			}

			if (!render) {
				const statusCode = (err as {$metadata?: {httpStatusCode?: number}})
					?.$metadata?.httpStatusCode;
				if (statusCode && statusCode >= 400 && statusCode < 500) {
					throw failure(
						err instanceof Error ? err.message : String(err),
						err,
						'failed',
					);
				}

				throw failure(
					`Lambda startup outcome is indeterminate; no render identity was received. The render may still be running. Start was not retried. ${err instanceof Error ? err.message : String(err)}`,
					err,
					'indeterminate',
				);
			}
			// Once identity is known, every transport failure recovers the same render.
		} finally {
			controller.abort();
			streamer.clear();
			pendingMessages = [];
			// Aborting closes the HTTP body; also release the event iterator, with a bound
			// for custom request handlers that do not implement abort correctly.
			if (iterator?.return) {
				let timer: ReturnType<typeof setTimeout> | null = null;
				try {
					await Promise.race([
						iterator.return().catch(() => undefined),
						new Promise<void>((resolve) => {
							timer = setTimeout(resolve, 1000);
						}),
					]);
				} finally {
					if (timer) {
						clearTimeout(timer);
					}
				}
			}
		}
	}

	if (!render) {
		throw failure(
			'Lambda startup outcome is indeterminate; the stream ended before render identity was received. Start was not retried.',
			null,
			'indeterminate',
		);
	}

	const identity: RenderMediaOnLambdaOutput = render;
	while (true) {
		if (Date.now() > deadline) {
			throw failure(
				'Timed out waiting for the Lambda render. Observation has stopped; the render was not cancelled.',
				null,
				'started',
			);
		}

		let status: RenderProgress;
		try {
			status = await getRenderProgress({
				functionName: input.functionName,
				region: input.region,
				renderId: identity.renderId,
				bucketName: identity.bucketName,
				forcePathStyle: input.forcePathStyle,
				requestHandler: input.requestHandler ?? undefined,
				logLevel: input.logLevel,
				s3OutputProvider:
					typeof input.outName === 'object' && input.outName !== null
						? (input.outName.s3OutputProvider ?? undefined)
						: undefined,
			});
		} catch (err) {
			throw failure(
				`Could not observe Lambda render: ${err instanceof Error ? err.message : String(err)}`,
				err,
				'started',
			);
		}

		const result = await updated(status);
		if (result) {
			return result;
		}

		await new Promise<void>((resolve) => setTimeout(resolve, 500));
	}
};

/**
 * Starts a media render and waits for completion, streaming progress when available.
 * Callback failures stop observation without cancelling the server-side render.
 * @see https://www.remotion.dev/docs/lambda/rendermediaonlambdaandwait
 */
export const renderMediaOnLambdaAndWait = async (
	options: RenderMediaOnLambdaAndWaitInput,
): Promise<RenderMediaOnLambdaAndWaitOutput> => {
	validateRenderMediaOnLambdaInput(options);
	return internalRenderMediaOnLambdaAndWait(
		renderMediaOnLambdaOptionalToRequired(options),
		{onInit: options.onInit ?? null, onProgress: options.onProgress ?? null},
	);
};
