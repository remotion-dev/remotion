import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {NoReactInternals} from 'remotion/no-react';
import {downloadMedia} from '../../../api/download-media';
import {getRenderProgress} from '../../../api/get-render-progress';
import {internalRenderMediaOnLambdaRaw} from '../../../api/render-media-on-lambda';
import type {EnhancedErrorInfo} from '../../../functions/helpers/write-lambda-error';
import type {RenderProgress} from '../../../shared/constants';

import {
	BINARY_NAME,
	DEFAULT_MAX_RETRIES,
	DEFAULT_OUTPUT_PRIVACY,
} from '../../../shared/constants';
import {sleep} from '../../../shared/sleep';
import {validateFramesPerLambda} from '../../../shared/validate-frames-per-lambda';
import type {LambdaCodec} from '../../../shared/validate-lambda-codec';
import {validatePrivacy} from '../../../shared/validate-privacy';
import {validateMaxRetries} from '../../../shared/validate-retries';
import {validateServeUrl} from '../../../shared/validate-serveurl';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {findFunctionName} from '../../helpers/find-function-name';
import {getWebhookCustomData} from '../../helpers/get-webhook-custom-data';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {makeMultiProgressFromStatus, makeProgressString} from './progress';

export const RENDER_COMMAND = 'render';

function getTotalFrames(status: RenderProgress): number | null {
	return status.renderMetadata
		? RenderInternals.getFramesToRender(
				status.renderMetadata.frameRange,
				status.renderMetadata.everyNthFrame,
			).length
		: null;
}

export const renderCommand = async (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	const serveUrl = args[0];
	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.',
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <composition-id> [output-location]`,
		);
		quit(1);
	}

	const region = getAwsRegion();

	const {
		chromiumOptions,
		crf,
		envVariables,
		frameRange,
		inputProps,
		pixelFormat,
		proResProfile,
		puppeteerTimeout,
		jpegQuality,
		scale,
		everyNthFrame,
		numberOfGifLoops,
		muted,
		overwrite,
		audioBitrate,
		videoBitrate,
		encodingMaxRate,
		encodingBufferSize,
		height,
		width,
		browserExecutable,
		offthreadVideoCacheSizeInBytes,
		colorSpace,
		deleteAfter,
		x264Preset,
	} = CliInternals.getCliOptions({
		type: 'series',
		isLambda: true,
		remotionRoot,
		logLevel,
	});

	let composition: string = args[1];
	if (!composition) {
		Log.info('No compositions passed. Fetching compositions...');

		validateServeUrl(serveUrl);

		if (!serveUrl.startsWith('https://') && !serveUrl.startsWith('http://')) {
			throw Error(
				'Passing the shorthand serve URL without composition name is currently not supported.\n Make sure to pass a composition name after the shorthand serve URL or pass the complete serveURL without composition name to get to choose between all compositions.',
			);
		}

		const server = await RenderInternals.prepareServer({
			concurrency: 1,
			indent: false,
			port: ConfigInternals.getRendererPortFromConfigFileAndCliFlag(),
			remotionRoot,
			logLevel,
			webpackConfigOrServeUrl: serveUrl,
			offthreadVideoCacheSizeInBytes,
		});

		const {compositionId} =
			await CliInternals.getCompositionWithDimensionOverride({
				args: args.slice(1),
				compositionIdFromUi: null,
				browserExecutable,
				chromiumOptions,
				envVariables,
				height,
				indent: false,
				serializedInputPropsWithCustomSchema:
					NoReactInternals.serializeJSONWithDate({
						indent: undefined,
						staticBase: null,
						data: inputProps,
					}).serializedString,
				port: ConfigInternals.getRendererPortFromConfigFileAndCliFlag(),
				puppeteerInstance: undefined,
				serveUrlOrWebpackUrl: serveUrl,
				timeoutInMilliseconds: puppeteerTimeout,
				logLevel,
				width,
				server,
				offthreadVideoCacheSizeInBytes,
			});
		composition = compositionId;
	}

	const outName = parsedLambdaCli['out-name'];
	const downloadName = args[2] ?? null;

	const {codec, reason} = CliInternals.getFinalOutputCodec({
		cliFlag: CliInternals.parsedCli.codec,
		downloadName,
		outName: outName ?? null,
		configFile: ConfigInternals.getOutputCodecOrUndefined() ?? null,
		uiCodec: null,
		compositionCodec: null,
	});

	const imageFormat = CliInternals.getVideoImageFormat({
		codec,
		uiImageFormat: null,
	});

	const functionName = await findFunctionName(logLevel);

	const maxRetries = parsedLambdaCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	validateMaxRetries(maxRetries);

	const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	validatePrivacy(privacy, true);
	const framesPerLambda = parsedLambdaCli['frames-per-lambda'] ?? undefined;
	validateFramesPerLambda({framesPerLambda, durationInFrames: 1});

	const webhookCustomData = getWebhookCustomData(logLevel);

	const res = await internalRenderMediaOnLambdaRaw({
		functionName,
		serveUrl,
		inputProps,
		codec: codec as LambdaCodec,
		imageFormat,
		crf: crf ?? undefined,
		envVariables,
		pixelFormat,
		proResProfile,
		jpegQuality,
		region,
		maxRetries,
		composition,
		framesPerLambda: framesPerLambda ?? null,
		privacy,
		logLevel,
		frameRange: frameRange ?? null,
		outName: parsedLambdaCli['out-name'] ?? null,
		timeoutInMilliseconds: puppeteerTimeout,
		chromiumOptions,
		scale,
		numberOfGifLoops,
		everyNthFrame,
		concurrencyPerLambda: parsedLambdaCli['concurrency-per-lambda'] ?? 1,
		muted,
		overwrite,
		audioBitrate,
		videoBitrate,
		encodingBufferSize,
		encodingMaxRate,
		forceHeight: height,
		forceWidth: width,
		webhook: parsedLambdaCli.webhook
			? {
					url: parsedLambdaCli.webhook,
					secret: parsedLambdaCli['webhook-secret'] ?? null,
					customData: webhookCustomData,
				}
			: null,
		rendererFunctionName: parsedLambdaCli['renderer-function-name'] ?? null,
		forceBucketName: parsedLambdaCli['force-bucket-name'] ?? null,
		audioCodec: CliInternals.parsedCli['audio-codec'],
		deleteAfter: deleteAfter ?? null,
		colorSpace,
		downloadBehavior: {type: 'play-in-browser'},
		offthreadVideoCacheSizeInBytes: offthreadVideoCacheSizeInBytes ?? null,
		x264Preset: x264Preset ?? null,
	});

	const totalSteps = downloadName ? 6 : 5;

	const progressBar = CliInternals.createOverwriteableCliOutput({
		quiet: CliInternals.quietFlagProvided(),
		cancelSignal: null,
		// No browser logs in Lambda
		updatesDontOverwrite: false,
		indent: false,
	});

	Log.info(
		CliInternals.chalk.gray(
			`bucket = ${res.bucketName}, function = ${functionName}`,
		),
	);
	Log.info(
		CliInternals.chalk.gray(
			`renderId = ${res.renderId}, codec = ${codec} (${reason})`,
		),
	);

	Log.verbose(
		{indent: false, logLevel},
		`CloudWatch logs (if enabled): ${res.cloudWatchLogs}`,
	);
	Log.verbose(
		{indent: false, logLevel},
		`Lambda insights (if enabled): ${res.lambdaInsightsLogs}`,
	);
	Log.verbose(
		{indent: false, logLevel},
		`Render folder: ${res.folderInS3Console}`,
	);
	const status = await getRenderProgress({
		functionName,
		bucketName: res.bucketName,
		renderId: res.renderId,
		region: getAwsRegion(),
	});
	const multiProgress = makeMultiProgressFromStatus(status);
	progressBar.update(
		makeProgressString({
			progress: multiProgress,
			steps: totalSteps,
			downloadInfo: null,
			retriesInfo: status.retriesInfo,
			logLevel,
			totalFrames: getTotalFrames(status),
			timeToEncode: status.timeToEncode,
		}),
		false,
	);

	// eslint-disable-next-line no-constant-condition
	while (true) {
		await sleep(1000);
		const newStatus = await getRenderProgress({
			functionName,
			bucketName: res.bucketName,
			renderId: res.renderId,
			region: getAwsRegion(),
		});
		const newProgress = makeMultiProgressFromStatus(newStatus);
		progressBar.update(
			makeProgressString({
				progress: newProgress,
				steps: totalSteps,
				retriesInfo: newStatus.retriesInfo,
				downloadInfo: null,
				logLevel,
				timeToEncode: newStatus.timeToEncode,
				totalFrames: getTotalFrames(newStatus),
			}),
			false,
		);

		if (newStatus.done) {
			progressBar.update(
				makeProgressString({
					progress: newProgress,
					steps: totalSteps,
					downloadInfo: null,
					retriesInfo: newStatus.retriesInfo,
					logLevel,
					timeToEncode: newStatus.timeToEncode,
					totalFrames: getTotalFrames(newStatus),
				}),
				false,
			);
			if (downloadName) {
				const downloadStart = Date.now();
				const {outputPath, sizeInBytes} = await downloadMedia({
					bucketName: res.bucketName,
					outPath: downloadName,
					region: getAwsRegion(),
					renderId: res.renderId,
					logLevel,
					onProgress: ({downloaded, totalSize}) => {
						progressBar.update(
							makeProgressString({
								progress: newProgress,
								steps: totalSteps,
								retriesInfo: newStatus.retriesInfo,
								downloadInfo: {
									doneIn: null,
									downloaded,
									totalSize,
								},
								logLevel,
								timeToEncode: newStatus.timeToEncode,
								totalFrames: getTotalFrames(newStatus),
							}),
							false,
						);
					},
				});
				progressBar.update(
					makeProgressString({
						progress: newProgress,
						steps: totalSteps,
						retriesInfo: newStatus.retriesInfo,
						downloadInfo: {
							doneIn: Date.now() - downloadStart,
							downloaded: sizeInBytes,
							totalSize: sizeInBytes,
						},
						logLevel,
						timeToEncode: newStatus.timeToEncode,
						totalFrames: getTotalFrames(newStatus),
					}),
					false,
				);
				Log.info();
				Log.info();
				Log.info('Done!', outputPath, CliInternals.formatBytes(sizeInBytes));
			} else {
				Log.info();
				Log.info();
				Log.info('Done! ' + newStatus.outputFile);
			}

			Log.info(
				[
					newStatus.renderMetadata
						? `${newStatus.renderMetadata.estimatedTotalLambdaInvokations} λ's used`
						: null,
					newStatus.timeToFinish
						? `${(newStatus.timeToFinish / 1000).toFixed(2)}sec`
						: null,
					`Estimated cost $${newStatus.costs.displayCost}`,
				]
					.filter(Boolean)
					.join(', '),
			);
			if (newStatus.mostExpensiveFrameRanges) {
				Log.verbose({indent: false, logLevel}, 'Most expensive frame ranges:');
				Log.verbose(
					{indent: false, logLevel},
					newStatus.mostExpensiveFrameRanges
						.map((f) => {
							return `${f.frameRange[0]}-${f.frameRange[1]} (Chunk ${f.chunk}, ${f.timeInMilliseconds}ms)`;
						})
						.join(', '),
				);
			}

			quit(0);
		}

		if (newStatus.fatalErrorEncountered) {
			Log.error('\n');
			const uniqueErrors: EnhancedErrorInfo[] = [];
			for (const err of newStatus.errors) {
				if (uniqueErrors.find((e) => e.stack === err.stack)) {
					continue;
				}

				uniqueErrors.push(err);
				if (err.explanation) {
					Log.error(err.explanation);
				}

				const frames = RenderInternals.parseStack(err.stack.split('\n'));

				const errorWithStackFrame = new RenderInternals.SymbolicateableError({
					message: err.message,
					frame: err.frame,
					name: err.name,
					stack: err.stack,
					stackFrame: frames,
				});
				await CliInternals.printError(errorWithStackFrame, logLevel);
			}

			Log.info();
			Log.info(
				`Accrued costs until error was thrown: ${newStatus.costs.displayCost}.`,
			);
			Log.info(
				'This is an estimate and continuing Lambda functions may incur additional costs.',
			);
			quit(1);
		}
	}
};
