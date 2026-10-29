import {
	LambdaClientInternals,
	ServerlessRoutines,
	type OrError,
	type ServerlessPayload,
	type StreamingPayload,
} from '@remotion/lambda-client';
import {RenderInternals} from '@remotion/renderer';
import {compositionsHandler} from './handlers/compositions';
import {launchHandler} from './handlers/launch';
import {progressHandler} from './handlers/progress';
import type {RequestContext} from './handlers/renderer';
import {rendererHandler} from './handlers/renderer';
import {startHandler} from './handlers/start';
import {stillHandler} from './handlers/still';
import {deleteTmpDir} from './helpers/clean-tmpdir';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {infoHandler} from './info';
import {getWarm, setWarm} from './is-warm';
import {printLoggingGrepHelper} from './print-logging-grep-helper';
import {makeS3RendererOutput} from './s3-renderer-output';
import type {ResponseStreamWriter} from './streaming/stream-writer';

export const innerHandler = async ({
	params,
	responseWriter,
	context,
}: {
	params: ServerlessPayload;
	responseWriter: ResponseStreamWriter;
	context: RequestContext;
}): Promise<void> => {
	const timeoutInMilliseconds = context.getRemainingTimeInMillis();

	RenderInternals.Log.verbose(
		{indent: false, logLevel: params.logLevel},
		'Request ID:',
		context.requestId,
	);

	await deleteTmpDir();
	const isWarm = getWarm();
	setWarm();

	if (params.type === ServerlessRoutines.still) {
		LambdaClientInternals.validateDeleteAfter(params.deleteAfter);
		const renderId = LambdaClientInternals.generateRandomHashWithLifeCycleRule({
			deleteAfter: params.deleteAfter,
			randomHashFn: LambdaClientInternals.randomHashImplementation,
		});
		if (LambdaClientInternals.isInsideLambda()) {
			printLoggingGrepHelper(
				ServerlessRoutines.still,
				{
					renderId,
					inputProps: JSON.stringify(params.inputProps),
					isWarm,
				},
				params.logLevel,
			);
		}

		try {
			await new Promise((resolve, reject) => {
				const onStream = async (payload: StreamingPayload) => {
					if (!params.streamed) {
						if (payload.type !== 'still-rendered') {
							throw new Error('Expected still-rendered');
						}

						await responseWriter.write(
							new TextEncoder().encode(JSON.stringify(payload.payload)),
						);
						return;
					}

					const message = LambdaClientInternals.makeStreamPayload({
						message: payload,
					});
					return new Promise<void>((innerResolve, innerReject) => {
						responseWriter
							.write(message)
							.then(() => {
								innerResolve();
							})
							.catch((err) => {
								reject(err);
								innerReject(err);
							});
					});
				};

				if (params.streamed) {
					onStream({
						type: 'render-id-determined',
						payload: {renderId},
					});
				}

				stillHandler({
					expectedBucketOwner: context.expectedBucketOwner,
					params,
					renderId,
					onStream,
					timeoutInMilliseconds,
				})
					.then((r) => {
						if (!params.streamed && r.type === 'error') {
							return responseWriter
								.write(new TextEncoder().encode(JSON.stringify(r)))
								.then(() => r);
						}

						return r;
					})
					.then((r) => {
						resolve(r);
					})
					.catch((err) => {
						reject(err);
					});
			});
			await responseWriter.end();
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log({err});
		}

		return;
	}

	if (params.type === ServerlessRoutines.start) {
		try {
			const renderId =
				LambdaClientInternals.generateRandomHashWithLifeCycleRule({
					deleteAfter: params.deleteAfter,
					randomHashFn: LambdaClientInternals.randomHashImplementation,
				});

			if (LambdaClientInternals.isInsideLambda()) {
				printLoggingGrepHelper(
					ServerlessRoutines.start,
					{
						renderId,
						inputProps: JSON.stringify(params.inputProps),
						isWarm,
					},
					params.logLevel,
				);
			}

			const response = await startHandler({
				params,
				options: {
					expectedBucketOwner: context.expectedBucketOwner,
					timeoutInMilliseconds,
					renderId,
				},
			});

			await responseWriter.write(
				new TextEncoder().encode(JSON.stringify(response)),
			);
			await responseWriter.end();
			return;
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log({err});
			const response: OrError<0> = {
				type: 'error',
				message: (err as Error).message,
				stack: (err as Error).stack as string,
			};
			await responseWriter.write(
				new TextEncoder().encode(JSON.stringify(response)),
			);
			await responseWriter.end();
			return;
		}
	}

	if (params.type === ServerlessRoutines.launch) {
		if (LambdaClientInternals.isInsideLambda()) {
			printLoggingGrepHelper(
				ServerlessRoutines.launch,
				{
					renderId: params.renderId,
					inputProps: JSON.stringify(params.inputProps),
					isWarm,
				},
				params.logLevel,
			);
		}

		await launchHandler({
			params,
			options: {
				expectedBucketOwner: context.expectedBucketOwner,
				getRemainingTimeInMillis: context.getRemainingTimeInMillis,
				requestContext: context,
			},
		});

		await responseWriter.write(new TextEncoder().encode(JSON.stringify({})));
		await responseWriter.end();
		return;
	}

	if (params.type === ServerlessRoutines.status) {
		if (LambdaClientInternals.isInsideLambda()) {
			printLoggingGrepHelper(
				ServerlessRoutines.status,
				{
					renderId: params.renderId,
					isWarm,
				},
				params.logLevel,
			);
		}

		const response = await progressHandler({
			params,
			options: {
				expectedBucketOwner: context.expectedBucketOwner,
				timeoutInMilliseconds,
				retriesRemaining: 2,
			},
		});

		await responseWriter.write(
			new TextEncoder().encode(JSON.stringify(response)),
		);
		await responseWriter.end();
		return;
	}

	if (params.type === ServerlessRoutines.renderer) {
		if (LambdaClientInternals.isInsideLambda()) {
			printLoggingGrepHelper(
				ServerlessRoutines.renderer,
				{
					renderId: params.renderId,
					chunk: String(params.chunk),
					dumpLogs: String(
						RenderInternals.isEqualOrBelowLogLevel(params.logLevel, 'verbose'),
					),
					resolvedProps: JSON.stringify(params.resolvedProps),
					isWarm,
				},
				params.logLevel,
			);
		}

		const region = getCurrentRegionInFunction();
		const transport =
			LambdaClientInternals.getRendererFunctionTransport(region);
		const s3Output =
			transport === 's3'
				? makeS3RendererOutput({
						params,
						expectedBucketOwner: context.expectedBucketOwner,
						region,
					})
				: null;
		await s3Output?.initialize();

		await new Promise((resolve, reject) => {
			rendererHandler({
				params,
				options: {
					expectedBucketOwner: context.expectedBucketOwner,
					isWarm,
				},
				onStream: s3Output
					? s3Output.onStream
					: (payload) => {
							const message = LambdaClientInternals.makeStreamPayload({
								message: payload,
							});

							const writeProm = responseWriter.write(message);

							return new Promise<void>((innerResolve, innerReject) => {
								writeProm
									.then(() => {
										innerResolve();
									})
									.catch((err) => {
										reject(err);
										innerReject(err);
									});
							});
						},
				onMediaFiles: s3Output?.uploadMediaAndComplete ?? null,
				executionMode: 'invoked',
				requestContext: context,
			})
				.then((res) => {
					resolve(res);
				})
				.catch((err) => {
					reject(err);
				});
		});

		await responseWriter.end();

		return;
	}

	if (params.type === ServerlessRoutines.info) {
		if (LambdaClientInternals.isInsideLambda()) {
			printLoggingGrepHelper(
				ServerlessRoutines.info,
				{
					isWarm,
				},
				params.logLevel,
			);
		}

		const response = await infoHandler(params);
		await responseWriter.write(
			new TextEncoder().encode(JSON.stringify(response)),
		);
		await responseWriter.end();
		return;
	}

	if (params.type === ServerlessRoutines.compositions) {
		if (LambdaClientInternals.isInsideLambda()) {
			printLoggingGrepHelper(
				ServerlessRoutines.compositions,
				{
					isWarm,
				},
				params.logLevel,
			);
		}

		const response = await compositionsHandler({
			params,
			options: {
				expectedBucketOwner: context.expectedBucketOwner,
			},
		});

		await responseWriter.write(
			new TextEncoder().encode(JSON.stringify(response)),
		);
		await responseWriter.end();

		return;
	}

	throw new Error(
		`${LambdaClientInternals.COMMAND_NOT_FOUND}: ${JSON.stringify(params)}`,
	);
};

export const innerRoutine = async ({
	params,
	responseWriter,
	context,
}: {
	params: ServerlessPayload;
	responseWriter: ResponseStreamWriter;
	context: RequestContext;
}): Promise<void> => {
	try {
		await innerHandler({
			params,
			responseWriter,
			context,
		});
	} catch (err) {
		const res: OrError<0> = {
			type: 'error',
			message: (err as Error).message,
			stack: (err as Error).stack as string,
		};

		await responseWriter.write(new TextEncoder().encode(JSON.stringify(res)));
		await responseWriter.end();
	}
};
