import {CliInternals} from '@remotion/cli';
import {ConfigInternals} from '@remotion/cli/config';
import {RenderInternals} from '@remotion/renderer';
import {downloadMedia} from '../../../api/download-media';
import {getRenderProgress} from '../../../api/get-render-progress';
import {renderMediaOnLambda} from '../../../api/render-media-on-lambda';
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
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {makeMultiProgressFromStatus, makeProgressString} from './progress';

export const RENDER_COMMAND = 'render';

export const renderCommand = async (args: string[], remotionRoot: string) => {
	const serveUrl = args[0];
	if (!serveUrl) {
		Log.error('No serve URL passed.');
		Log.info(
			'Pass an additional argument specifying a URL where your Remotion project is hosted.'
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <composition-id> [output-location]`
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
		logLevel,
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
		height,
		width,
		browserExecutable,
		port,
	} = await CliInternals.getCliOptions({
		type: 'series',
		isLambda: true,
		remotionRoot,
	});

	let composition: string = args[1];
	if (!composition) {
		Log.info('No compositions passed. Fetching compositions...');

		validateServeUrl(serveUrl);

		const server = RenderInternals.prepareServer({
			concurrency: 1,
			indent: false,
			port,
			remotionRoot,
			verbose: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose'),
			webpackConfigOrServeUrl: serveUrl,
		});

		const {compositionId} =
			await CliInternals.getCompositionWithDimensionOverride({
				args,
				compositionIdFromUi: null,
				browserExecutable,
				chromiumOptions,
				envVariables,
				height,
				indent: false,
				inputProps,
				port,
				puppeteerInstance: undefined,
				serveUrlOrWebpackUrl: serveUrl,
				timeoutInMilliseconds: puppeteerTimeout,
				verbose: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose'),
				width,
				server: await server,
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
	});

	const imageFormat = CliInternals.getVideoImageFormat({
		codec,
		uiImageFormat: null,
	});

	const functionName = await findFunctionName();

	const maxRetries = parsedLambdaCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	validateMaxRetries(maxRetries);

	const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	validatePrivacy(privacy, true);
	const framesPerLambda = parsedLambdaCli['frames-per-lambda'] ?? undefined;
	validateFramesPerLambda({framesPerLambda, durationInFrames: 1});

	const res = await renderMediaOnLambda({
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
		framesPerLambda,
		privacy,
		logLevel,
		frameRange: frameRange ?? undefined,
		outName: parsedLambdaCli['out-name'],
		timeoutInMilliseconds: puppeteerTimeout,
		chromiumOptions,
		scale,
		numberOfGifLoops,
		everyNthFrame,
		concurrencyPerLambda: parsedLambdaCli['concurrency-per-lambda'],
		muted,
		overwrite,
		audioBitrate,
		videoBitrate,
		forceHeight: height,
		forceWidth: width,
		webhook: parsedLambdaCli.webhook
			? {
					url: parsedLambdaCli.webhook,
					secret: parsedLambdaCli['webhook-secret'] ?? null,
			  }
			: undefined,
		rendererFunctionName: parsedLambdaCli['renderer-function-name'] ?? null,
		forceBucketName: parsedLambdaCli['force-bucket-name'],
		audioCodec: CliInternals.parsedCli['audio-codec'],
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
			`bucket = ${res.bucketName}, function = ${functionName}`
		)
	);
	Log.info(
		CliInternals.chalk.gray(
			`renderId = ${res.renderId}, codec = ${codec} (${reason})`
		)
	);
	const verbose = RenderInternals.isEqualOrBelowLogLevel(
		ConfigInternals.Logging.getLogLevel(),
		'verbose'
	);

	Log.verbose(`CloudWatch logs (if enabled): ${res.cloudWatchLogs}`);
	Log.verbose(`Render folder: ${res.folderInS3Console}`);
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
			verbose,
			totalFrames: getTotalFrames(status),
			timeToEncode: status.timeToEncode,
		}),
		false
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
				verbose,
				timeToEncode: newStatus.timeToEncode,
				totalFrames: getTotalFrames(newStatus),
			}),
			false
		);

		if (newStatus.done) {
			progressBar.update(
				makeProgressString({
					progress: newProgress,
					steps: totalSteps,
					downloadInfo: null,
					retriesInfo: newStatus.retriesInfo,
					verbose,
					timeToEncode: newStatus.timeToEncode,
					totalFrames: getTotalFrames(newStatus),
				}),
				false
			);
			if (downloadName) {
				const downloadStart = Date.now();
				const {outputPath, sizeInBytes} = await downloadMedia({
					bucketName: res.bucketName,
					outPath: downloadName,
					region: getAwsRegion(),
					renderId: res.renderId,
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
								verbose,
								timeToEncode: newStatus.timeToEncode,
								totalFrames: getTotalFrames(newStatus),
							}),
							false
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
						verbose,
						timeToEncode: newStatus.timeToEncode,
						totalFrames: getTotalFrames(newStatus),
					}),
					false
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
					.join(', ')
			);
			if (newStatus.mostExpensiveFrameRanges) {
				Log.verbose('Most expensive frame ranges:');
				Log.verbose(
					newStatus.mostExpensiveFrameRanges
						.map((f) => {
							return `${f.frameRange[0]}-${f.frameRange[1]} (${f.timeInMilliseconds}ms)`;
						})
						.join(', ')
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
				await CliInternals.handleCommonError(errorWithStackFrame, logLevel);
			}

			quit(1);
		}
	}
};

function getTotalFrames(status: RenderProgress): number | null {
	return status.renderMetadata
		? RenderInternals.getFramesToRender(
				status.renderMetadata.frameRange,
				status.renderMetadata.everyNthFrame
		  ).length
		: null;
}
