import {RenderInternals} from '@remotion/renderer';
import type {
	CloudProvider,
	OrError,
	ProviderSpecifics,
	ServerlessPayload,
	StreamingPayload,
} from '@remotion/serverless-client';
import {
	COMMAND_NOT_FOUND,
	makeStreamPayload,
	ServerlessRoutines,
} from '@remotion/serverless-client';
import {compositionsHandler} from './handlers/compositions';
import {launchHandler} from './handlers/launch';
import {progressHandler} from './handlers/progress';
import type {RequestContext} from './handlers/renderer';
import {rendererHandler} from './handlers/renderer';
import {startHandler} from './handlers/start';
import {stillHandler} from './handlers/still';
import {infoHandler} from './info';
import {getWarm, setWarm} from './is-warm';
import {setCurrentRequestId, stopLeakDetection} from './leak-detection';
import {printLoggingGrepHelper} from './print-logging-grep-helper';
import type {InsideFunctionSpecifics} from './provider-implementation';
import type {ResponseStreamWriter} from './streaming/stream-writer';

export const innerHandler = async <Provider extends CloudProvider>({
	params,
	responseWriter,
	context,
	providerSpecifics,
	insideFunctionSpecifics,
}: {
	params: ServerlessPayload<Provider>;
	responseWriter: ResponseStreamWriter;
	context: RequestContext;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
}): Promise<void> => {
	setCurrentRequestId(context.awsRequestId);
	process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA = 'true';
	const timeoutInMilliseconds = context.getRemainingTimeInMillis();

	RenderInternals.Log.verbose(
		{indent: false, logLevel: params.logLevel},
		'AWS Request ID:',
		context.awsRequestId,
	);
	stopLeakDetection();
	if (!context?.invokedFunctionArn) {
		throw new Error(
			'Lambda function unexpectedly does not have context.invokedFunctionArn',
		);
	}

	await insideFunctionSpecifics.deleteTmpDir();
	const isWarm = getWarm();
	setWarm();

	const currentUserId = context.invokedFunctionArn.split(':')[4];
	if (!currentUserId) {
		throw new Error('Expected current user ID');
	}

	if (params.type === ServerlessRoutines.still) {
		providerSpecifics.validateDeleteAfter(params.deleteAfter);
		const renderId = insideFunctionSpecifics.generateRandomId({
			deleteAfter: params.deleteAfter,
			randomHashFn: providerSpecifics.randomHash,
		});
		if (providerSpecifics.printLoggingHelper) {
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
				const onStream = async (payload: StreamingPayload<Provider>) => {
					if (!params.streamed) {
						if (payload.type !== 'still-rendered') {
							throw new Error('Expected still-rendered');
						}

						await responseWriter.write(
							Buffer.from(JSON.stringify(payload.payload)),
						);
						return;
					}

					const message = makeStreamPayload({
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
					expectedBucketOwner: currentUserId,
					params,
					renderId,
					onStream,
					timeoutInMilliseconds,
					providerSpecifics,
					insideFunctionSpecifics,
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
			const renderId = insideFunctionSpecifics.generateRandomId({
				deleteAfter: params.deleteAfter,
				randomHashFn: providerSpecifics.randomHash,
			});

			if (providerSpecifics.printLoggingHelper) {
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
					expectedBucketOwner: currentUserId,
					timeoutInMilliseconds,
					renderId,
				},
				providerSpecifics,
				insideFunctionSpecifics,
			});

			await responseWriter.write(Buffer.from(JSON.stringify(response)));
			await responseWriter.end();
			return;
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log({err});
			await responseWriter.write(
				Buffer.from(
					JSON.stringify({type: 'error', message: (err as Error).message}),
				),
			);
			return;
		}
	}

	if (params.type === ServerlessRoutines.launch) {
		if (providerSpecifics.printLoggingHelper) {
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

		const response = await launchHandler({
			params,
			options: {
				expectedBucketOwner: currentUserId,
				getRemainingTimeInMillis: context.getRemainingTimeInMillis,
			},
			providerSpecifics,
			insideFunctionSpecifics,
		});

		await responseWriter.write(Buffer.from(JSON.stringify(response)));
		await responseWriter.end();
		return;
	}

	if (params.type === ServerlessRoutines.status) {
		if (providerSpecifics.printLoggingHelper) {
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
				expectedBucketOwner: currentUserId,
				timeoutInMilliseconds,
				retriesRemaining: 2,
				providerSpecifics,
				insideFunctionSpecifics,
			},
		});

		await responseWriter.write(Buffer.from(JSON.stringify(response)));
		await responseWriter.end();
		return;
	}

	if (params.type === ServerlessRoutines.renderer) {
		if (providerSpecifics.printLoggingHelper) {
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

		await new Promise((resolve, reject) => {
			rendererHandler({
				params,
				options: {
					expectedBucketOwner: currentUserId,
					isWarm,
				},
				onStream: (payload) => {
					const message = makeStreamPayload({
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
				requestContext: context,
				providerSpecifics,
				insideFunctionSpecifics,
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
		if (providerSpecifics.printLoggingHelper) {
			printLoggingGrepHelper(
				ServerlessRoutines.info,
				{
					isWarm,
				},
				params.logLevel,
			);
		}

		const response = await infoHandler(params);
		await responseWriter.write(Buffer.from(JSON.stringify(response)));
		await responseWriter.end();
		return;
	}

	if (params.type === ServerlessRoutines.compositions) {
		if (providerSpecifics.printLoggingHelper) {
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
				expectedBucketOwner: currentUserId,
			},
			providerSpecifics,
			insideFunctionSpecifics,
		});

		await responseWriter.write(Buffer.from(JSON.stringify(response)));
		await responseWriter.end();

		return;
	}

	throw new Error(`${COMMAND_NOT_FOUND}: ${JSON.stringify(params)}`);
};

export const innerRoutine = async <Provider extends CloudProvider>({
	params,
	responseWriter,
	context,
	providerSpecifics,
	insideFunctionSpecifics,
}: {
	params: ServerlessPayload<Provider>;
	responseWriter: ResponseStreamWriter;
	context: RequestContext;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
}): Promise<void> => {
	try {
		await innerHandler({
			params,
			responseWriter,
			context,
			providerSpecifics,
			insideFunctionSpecifics,
		});
	} catch (err) {
		const res: OrError<0> = {
			type: 'error',
			message: (err as Error).message,
			stack: (err as Error).stack as string,
		};

		await responseWriter.write(Buffer.from(JSON.stringify(res)));
		await responseWriter.end();
	}
};
