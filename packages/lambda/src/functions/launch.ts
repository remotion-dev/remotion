import {InvokeCommand} from '@aws-sdk/client-lambda';
import {RenderInternals} from '@remotion/renderer';
import fs, {existsSync, mkdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {Internals} from 'remotion';
import {VERSION} from 'remotion/version';
import {getLambdaClient} from '../shared/aws-clients';
import {cleanupSerializedInputProps} from '../shared/cleanup-serialized-input-props';
import type {LambdaPayload, RenderMetadata} from '../shared/constants';
import {
	CONCAT_FOLDER_TOKEN,
	encodingProgressKey,
	ENCODING_PROGRESS_STEP_SIZE,
	initalizedMetadataKey,
	LambdaRoutines,
	MAX_FUNCTIONS_PER_RENDER,
	renderMetadataKey,
	rendersPrefix,
} from '../shared/constants';
import {deserializeInputProps} from '../shared/deserialize-input-props';
import {DOCS_URL} from '../shared/docs-url';
import {invokeWebhook} from '../shared/invoke-webhook';
import {getServeUrlHash} from '../shared/make-s3-url';
import {validateFramesPerLambda} from '../shared/validate-frames-per-lambda';
import {validateOutname} from '../shared/validate-outname';
import {validatePrivacy} from '../shared/validate-privacy';
import {planFrameRanges} from './chunk-optimization/plan-frame-ranges';
import {bestFramesPerLambdaParam} from './helpers/best-frames-per-lambda-param';
import {concatVideosS3, getAllFilesS3} from './helpers/concat-videos';
import {createPostRenderData} from './helpers/create-post-render-data';
import {cleanupFiles} from './helpers/delete-chunks';
import {getExpectedOutName} from './helpers/expected-out-name';
import {findOutputFileInBucket} from './helpers/find-output-file-in-bucket';
import {getBrowserInstance} from './helpers/get-browser-instance';
import {getCurrentRegionInFunction} from './helpers/get-current-region';
import {getFilesToDelete} from './helpers/get-files-to-delete';
import {getOutputUrlFromMetadata} from './helpers/get-output-url-from-metadata';
import {inspectErrors} from './helpers/inspect-errors';
import {lambdaDeleteFile, lambdaLs, lambdaWriteFile} from './helpers/io';
import {timer} from './helpers/timer';
import {validateComposition} from './helpers/validate-composition';
import type {EnhancedErrorInfo} from './helpers/write-lambda-error';
import {
	getTmpDirStateIfENoSp,
	writeLambdaError,
} from './helpers/write-lambda-error';
import {writePostRenderData} from './helpers/write-post-render-data';

type Options = {
	expectedBucketOwner: string;
	getRemainingTimeInMillis: () => number;
};

const callFunctionWithRetry = async ({
	payload,
	retries,
	functionName,
}: {
	payload: unknown;
	retries: number;
	functionName: string;
}): Promise<unknown> => {
	try {
		await getLambdaClient(getCurrentRegionInFunction()).send(
			new InvokeCommand({
				FunctionName: functionName,
				// @ts-expect-error
				Payload: JSON.stringify(payload),
				InvocationType: 'Event',
			}),
			{}
		);
	} catch (err) {
		if ((err as Error).name === 'ResourceConflictException') {
			if (retries > 10) {
				throw err;
			}

			await new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});
			return callFunctionWithRetry({
				payload,
				retries: retries + 1,
				functionName,
			});
		}

		throw err;
	}
};

const innerLaunchHandler = async (params: LambdaPayload, options: Options) => {
	if (params.type !== LambdaRoutines.launch) {
		throw new Error('Expected launch type');
	}

	const functionName =
		params.rendererFunctionName ??
		(process.env.AWS_LAMBDA_FUNCTION_NAME as string);

	const startedDate = Date.now();

	let webhookInvoked = false;
	console.log(
		`Function has ${Math.max(
			options.getRemainingTimeInMillis() - 1000,
			1000
		)} before it times out`
	);
	const verbose = RenderInternals.isEqualOrBelowLogLevel(
		params.logLevel,
		'verbose'
	);
	const webhookDueToTimeout = setTimeout(async () => {
		if (params.webhook && !webhookInvoked) {
			try {
				await invokeWebhook({
					url: params.webhook.url,
					secret: params.webhook.secret,
					payload: {
						type: 'timeout',
						renderId: params.renderId,
						expectedBucketOwner: options.expectedBucketOwner,
						bucketName: params.bucketName,
					},
				});
				webhookInvoked = true;
			} catch (err) {
				if (process.env.NODE_ENV === 'test') {
					throw err;
				}

				await writeLambdaError({
					bucketName: params.bucketName,
					errorInfo: {
						type: 'webhook',
						message: (err as Error).message,
						name: (err as Error).name as string,
						stack: (err as Error).stack as string,
						tmpDir: null,
						frame: 0,
						chunk: 0,
						isFatal: false,
						attempt: 1,
						willRetry: false,
						totalAttempts: 1,
					},
					renderId: params.renderId,
					expectedBucketOwner: options.expectedBucketOwner,
				});
				console.log('Failed to invoke webhook:');
				console.log(err);
			}
		}
	}, Math.max(options.getRemainingTimeInMillis() - 1000, 1000));

	const browserInstance = await getBrowserInstance(
		verbose,
		params.chromiumOptions
	);

	const inputPropsPromise = deserializeInputProps({
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		serialized: params.inputProps,
	});

	const comp = await validateComposition({
		serveUrl: params.serveUrl,
		composition: params.composition,
		browserInstance,
		inputProps: await inputPropsPromise,
		envVariables: params.envVariables ?? {},
		timeoutInMilliseconds: params.timeoutInMilliseconds,
		chromiumOptions: params.chromiumOptions,
		port: null,
		forceHeight: params.forceHeight,
		forceWidth: params.forceWidth,
		logLevel: params.logLevel,
		server: undefined,
	});
	Internals.validateDurationInFrames({
		durationInFrames: comp.durationInFrames,
		component: 'passed to a Lambda render',
		allowFloats: false,
	});
	Internals.validateFps(comp.fps, 'passed to a Lambda render', false);
	Internals.validateDimension(
		comp.height,
		'height',
		'passed to a Lambda render'
	);
	Internals.validateDimension(comp.width, 'width', 'passed to a Lambda render');

	RenderInternals.validateBitrate(params.audioBitrate, 'audioBitrate');
	RenderInternals.validateBitrate(params.videoBitrate, 'videoBitrate');

	RenderInternals.validateConcurrency(
		params.concurrencyPerLambda,
		'concurrencyPerLambda'
	);

	const realFrameRange = RenderInternals.getRealFrameRange(
		comp.durationInFrames,
		params.frameRange
	);

	const frameCount = RenderInternals.getFramesToRender(
		realFrameRange,
		params.everyNthFrame
	);

	const framesPerLambda =
		params.framesPerLambda ?? bestFramesPerLambdaParam(frameCount.length);

	validateFramesPerLambda({
		framesPerLambda,
		durationInFrames: frameCount.length,
	});

	const chunkCount = Math.ceil(frameCount.length / framesPerLambda);

	if (chunkCount > MAX_FUNCTIONS_PER_RENDER) {
		throw new Error(
			`Too many functions: This render would cause ${chunkCount} functions to spawn. We limit this amount to ${MAX_FUNCTIONS_PER_RENDER} functions as more would result in diminishing returns. Values set: frameCount = ${frameCount}, framesPerLambda=${framesPerLambda}. See ${DOCS_URL}/docs/lambda/concurrency#too-many-functions for help.`
		);
	}

	validateOutname(params.outName, params.codec, params.audioCodec);
	validatePrivacy(params.privacy, true);
	RenderInternals.validatePuppeteerTimeout(params.timeoutInMilliseconds);

	const {chunks} = planFrameRanges({
		framesPerLambda,
		frameRange: realFrameRange,
		everyNthFrame: params.everyNthFrame,
	});

	const sortedChunks = chunks.slice().sort((a, b) => a[0] - b[0]);

	const reqSend = timer('sending off requests');
	const lambdaPayloads = chunks.map((chunkPayload) => {
		const payload: LambdaPayload = {
			type: LambdaRoutines.renderer,
			frameRange: chunkPayload,
			serveUrl: params.serveUrl,
			chunk: sortedChunks.indexOf(chunkPayload),
			composition: params.composition,
			fps: comp.fps,
			height: comp.height,
			width: comp.width,
			durationInFrames: comp.durationInFrames,
			bucketName: params.bucketName,
			retriesLeft: params.maxRetries,
			inputProps: params.inputProps,
			renderId: params.renderId,
			imageFormat: params.imageFormat,
			codec: params.codec,
			crf: params.crf,
			envVariables: params.envVariables,
			pixelFormat: params.pixelFormat,
			proResProfile: params.proResProfile,
			jpegQuality: params.jpegQuality,
			privacy: params.privacy,
			logLevel: params.logLevel ?? 'info',
			attempt: 1,
			timeoutInMilliseconds: params.timeoutInMilliseconds,
			chromiumOptions: params.chromiumOptions,
			scale: params.scale,
			everyNthFrame: params.everyNthFrame,
			concurrencyPerLambda: params.concurrencyPerLambda,
			muted: params.muted,
			audioBitrate: params.audioBitrate,
			videoBitrate: params.videoBitrate,
			launchFunctionConfig: {
				version: VERSION,
			},
			dumpBrowserLogs: params.dumpBrowserLogs,
		};
		return payload;
	});

	console.log(
		'Render plan: ',
		chunks.map((c, i) => `Chunk ${i} (Frames ${c[0]} - ${c[1]})`).join(', ')
	);

	const renderMetadata: RenderMetadata = {
		startedDate,
		videoConfig: comp,
		totalChunks: chunks.length,
		estimatedTotalLambdaInvokations: [
			// Direct invokations
			chunks.length,
			// This function
			1,
		].reduce((a, b) => a + b, 0),
		estimatedRenderLambdaInvokations: chunks.length,
		compositionId: comp.id,
		siteId: getServeUrlHash(params.serveUrl),
		codec: params.codec,
		type: 'video',
		imageFormat: params.imageFormat,
		inputProps: params.inputProps,
		lambdaVersion: VERSION,
		framesPerLambda,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		region: getCurrentRegionInFunction(),
		renderId: params.renderId,
		outName: params.outName ?? undefined,
		privacy: params.privacy,
		everyNthFrame: params.everyNthFrame,
		frameRange: realFrameRange,
		audioCodec: params.audioCodec,
	};

	const {key, renderBucketName, customCredentials} = getExpectedOutName(
		renderMetadata,
		params.bucketName,
		typeof params.outName === 'string' || typeof params.outName === 'undefined'
			? null
			: params.outName?.s3OutputProvider ?? null
	);

	const output = await findOutputFileInBucket({
		bucketName: params.bucketName,
		customCredentials,
		region: getCurrentRegionInFunction(),
		renderMetadata,
	});

	if (output) {
		if (params.overwrite) {
			console.info(
				'Deleting',
				{bucketName: renderBucketName, key},
				'because it already existed and will be overwritten'
			);
			await lambdaDeleteFile({
				bucketName: renderBucketName,
				customCredentials,
				key,
				region: getCurrentRegionInFunction(),
			});
		} else {
			throw new TypeError(
				`Output file "${key}" in bucket "${renderBucketName}" in region "${getCurrentRegionInFunction()}" already exists. Delete it before re-rendering, or use the overwrite option to delete it before render."`
			);
		}
	}

	await lambdaWriteFile({
		bucketName: params.bucketName,
		key: renderMetadataKey(params.renderId),
		body: JSON.stringify(renderMetadata),
		region: getCurrentRegionInFunction(),
		privacy: 'private',
		expectedBucketOwner: options.expectedBucketOwner,
		downloadBehavior: null,
		customCredentials: null,
	});

	await Promise.all(
		lambdaPayloads.map(async (payload) => {
			await callFunctionWithRetry({payload, retries: 0, functionName});
		})
	);

	reqSend.end();

	let lastProgressUploaded = 0;

	const onProgress = (framesEncoded: number) => {
		const relativeProgress = framesEncoded / frameCount.length;
		const deltaSinceLastProgressUploaded =
			relativeProgress - lastProgressUploaded;

		if (deltaSinceLastProgressUploaded < 0.1) {
			return;
		}

		lastProgressUploaded = relativeProgress;

		lambdaWriteFile({
			bucketName: params.bucketName,
			key: encodingProgressKey(params.renderId),
			body: String(Math.round(framesEncoded / ENCODING_PROGRESS_STEP_SIZE)),
			region: getCurrentRegionInFunction(),
			privacy: 'private',
			expectedBucketOwner: options.expectedBucketOwner,
			downloadBehavior: null,
			customCredentials: null,
		}).catch((err) => {
			writeLambdaError({
				bucketName: params.bucketName,
				errorInfo: {
					chunk: null,
					frame: null,
					isFatal: false,
					name: (err as Error).name,
					message: (err as Error).message,
					stack: `Could not upload stitching progress ${
						(err as Error).stack as string
					}`,
					tmpDir: null,
					type: 'stitcher',
					attempt: 1,
					totalAttempts: 1,
					willRetry: false,
				},
				renderId: params.renderId,
				expectedBucketOwner: options.expectedBucketOwner,
			});
		});
	};

	const onErrors = async (errors: EnhancedErrorInfo[]) => {
		console.log('Found Errors', errors);

		if (params.webhook) {
			console.log('Sending webhook with errors');
			await invokeWebhook({
				url: params.webhook.url,
				secret: params.webhook.secret ?? null,
				payload: {
					type: 'error',
					renderId: params.renderId,
					expectedBucketOwner: options.expectedBucketOwner,
					bucketName: params.bucketName,
					errors: errors.slice(0, 5).map((e) => ({
						message: e.message,
						name: e.name as string,
						stack: e.stack as string,
					})),
				},
			});
		} else {
			console.log('No webhook specified');
		}

		throw new Error(
			'Stopping Lambda function because error occurred: ' + errors[0].stack
		);
	};

	const fps = comp.fps / params.everyNthFrame;

	const outdir = join(RenderInternals.tmpDir(CONCAT_FOLDER_TOKEN), 'bucket');
	if (existsSync(outdir)) {
		rmSync(outdir, {
			recursive: true,
		});
	}

	mkdirSync(outdir);
	const files = await getAllFilesS3({
		bucket: params.bucketName,
		expectedFiles: chunkCount,
		outdir,
		renderId: params.renderId,
		region: getCurrentRegionInFunction(),
		expectedBucketOwner: options.expectedBucketOwner,
		onErrors,
	});
	const encodingStart = Date.now();
	const {outfile, cleanupChunksProm} = await concatVideosS3({
		onProgress,
		numberOfFrames: frameCount.length,
		codec: params.codec,
		fps,
		numberOfGifLoops: params.numberOfGifLoops,
		files,
		outdir,
		audioCodec: params.audioCodec,
	});
	const encodingStop = Date.now();

	const outputSize = fs.statSync(outfile);

	await lambdaWriteFile({
		bucketName: renderBucketName,
		key,
		body: fs.createReadStream(outfile),
		region: getCurrentRegionInFunction(),
		privacy: params.privacy,
		expectedBucketOwner: options.expectedBucketOwner,
		downloadBehavior: params.downloadBehavior,
		customCredentials,
	});

	const contents = await lambdaLs({
		bucketName: params.bucketName,
		prefix: rendersPrefix(params.renderId),
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
	});
	const finalEncodingProgressProm = lambdaWriteFile({
		bucketName: params.bucketName,
		key: encodingProgressKey(params.renderId),
		body: String(Math.ceil(frameCount.length / ENCODING_PROGRESS_STEP_SIZE)),
		region: getCurrentRegionInFunction(),
		privacy: 'private',
		expectedBucketOwner: options.expectedBucketOwner,
		downloadBehavior: null,
		customCredentials: null,
	});

	const errorExplanationsProm = inspectErrors({
		contents,
		renderId: params.renderId,
		bucket: params.bucketName,
		region: getCurrentRegionInFunction(),
		expectedBucketOwner: options.expectedBucketOwner,
	});

	const jobs = getFilesToDelete({
		chunkCount,
		renderId: params.renderId,
	});

	const deletProm = verbose
		? Promise.resolve(0)
		: cleanupFiles({
				region: getCurrentRegionInFunction(),
				bucket: params.bucketName,
				contents,
				jobs,
		  });

	const cleanupSerializedInputPropsProm = cleanupSerializedInputProps({
		bucketName: params.bucketName,
		region: getCurrentRegionInFunction(),
		serialized: params.inputProps,
	});

	const outputUrl = getOutputUrlFromMetadata(
		renderMetadata,
		params.bucketName,
		customCredentials
	);
	const postRenderData = createPostRenderData({
		expectedBucketOwner: options.expectedBucketOwner,
		region: getCurrentRegionInFunction(),
		renderId: params.renderId,
		memorySizeInMb: Number(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE),
		renderMetadata,
		contents,
		errorExplanations: await errorExplanationsProm,
		timeToEncode: encodingStop - encodingStart,
		timeToDelete: (
			await Promise.all([deletProm, cleanupSerializedInputPropsProm])
		).reduce((a, b) => a + b, 0),
		outputFile: {
			lastModified: Date.now(),
			size: outputSize.size,
			url: outputUrl,
		},
	});
	await finalEncodingProgressProm;
	await writePostRenderData({
		bucketName: params.bucketName,
		expectedBucketOwner: options.expectedBucketOwner,
		postRenderData,
		region: getCurrentRegionInFunction(),
		renderId: params.renderId,
	});
	await lambdaDeleteFile({
		bucketName: params.bucketName,
		key: initalizedMetadataKey(params.renderId),
		region: getCurrentRegionInFunction(),
		customCredentials: null,
	});

	await Promise.all([cleanupChunksProm, fs.promises.rm(outfile)]);

	clearTimeout(webhookDueToTimeout);
	if (params.webhook && !webhookInvoked) {
		try {
			await invokeWebhook({
				url: params.webhook.url,
				secret: params.webhook.secret,
				payload: {
					type: 'success',
					renderId: params.renderId,
					expectedBucketOwner: options.expectedBucketOwner,
					bucketName: params.bucketName,
					outputUrl,
					lambdaErrors: postRenderData.errors,
					outputFile: postRenderData.outputFile,
					timeToFinish: postRenderData.timeToFinish,
					costs: postRenderData.cost,
				},
			});
			webhookInvoked = true;
		} catch (err) {
			if (process.env.NODE_ENV === 'test') {
				throw err;
			}

			await writeLambdaError({
				bucketName: params.bucketName,
				errorInfo: {
					type: 'webhook',
					message: (err as Error).message,
					name: (err as Error).name as string,
					stack: (err as Error).stack as string,
					tmpDir: null,
					frame: 0,
					chunk: 0,
					isFatal: false,
					attempt: 1,
					willRetry: false,
					totalAttempts: 1,
				},
				renderId: params.renderId,
				expectedBucketOwner: options.expectedBucketOwner,
			});
			console.log('Failed to invoke webhook:');
			console.log(err);
		}
	}
};

export const launchHandler = async (
	params: LambdaPayload,
	options: Options
) => {
	if (params.type !== LambdaRoutines.launch) {
		throw new Error('Expected launch type');
	}

	try {
		await innerLaunchHandler(params, options);
	} catch (err) {
		if (process.env.NODE_ENV === 'test') {
			throw err;
		}

		console.log('Error occurred', err);
		await writeLambdaError({
			bucketName: params.bucketName,
			errorInfo: {
				chunk: null,
				frame: null,
				name: (err as Error).name as string,
				stack: (err as Error).stack as string,
				type: 'stitcher',
				isFatal: true,
				tmpDir: getTmpDirStateIfENoSp((err as Error).stack as string),
				attempt: 1,
				totalAttempts: 1,
				willRetry: false,
				message: (err as Error).message,
			},
			expectedBucketOwner: options.expectedBucketOwner,
			renderId: params.renderId,
		});
		if (params.webhook?.url) {
			try {
				await invokeWebhook({
					url: params.webhook.url,
					secret: params.webhook.secret ?? null,
					payload: {
						type: 'error',
						renderId: params.renderId,
						expectedBucketOwner: options.expectedBucketOwner,
						bucketName: params.bucketName,
						errors: [err as Error].map((e) => ({
							message: e.message,
							name: e.name as string,
							stack: e.stack as string,
						})),
					},
				});
			} catch (error) {
				if (process.env.NODE_ENV === 'test') {
					throw error;
				}

				await writeLambdaError({
					bucketName: params.bucketName,
					errorInfo: {
						type: 'webhook',
						message: (err as Error).message,
						name: (err as Error).name as string,
						stack: (err as Error).stack as string,
						tmpDir: null,
						frame: 0,
						chunk: 0,
						isFatal: false,
						attempt: 1,
						willRetry: false,
						totalAttempts: 1,
					},
					renderId: params.renderId,
					expectedBucketOwner: options.expectedBucketOwner,
				});
				console.log('Failed to invoke webhook:');
				console.log(error);
			}
		}
	}
};
