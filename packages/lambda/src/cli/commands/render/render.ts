import {CliInternals} from '@remotion/cli';
import {RenderInternals} from '@remotion/renderer';
import {downloadMedia} from '../../../api/download-media';
import {getRenderProgress} from '../../../api/get-render-progress';
import {renderMediaOnLambda} from '../../../api/render-media-on-lambda';
import {
	BINARY_NAME,
	DEFAULT_MAX_RETRIES,
	DEFAULT_OUTPUT_PRIVACY,
	LambdaRoutines,
} from '../../../shared/constants';
import {sleep} from '../../../shared/sleep';
import {validateFramesPerLambda} from '../../../shared/validate-frames-per-lambda';
import type {LambdaCodec} from '../../../shared/validate-lambda-codec';
import {validatePrivacy} from '../../../shared/validate-privacy';
import {validateMaxRetries} from '../../../shared/validate-retries';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {findFunctionName} from '../../helpers/find-function-name';
import {getCloudwatchStreamUrl} from '../../helpers/get-cloudwatch-stream-url';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
import {makeMultiProgressFromStatus, makeProgressString} from './progress';

export const RENDER_COMMAND = 'render';

export const renderCommand = async (args: string[]) => {
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

	const composition = args[1];
	if (!composition) {
		Log.error('No composition ID passed.');
		Log.info('Pass an additional argument specifying the composition ID.');
		Log.info();
		Log.info(
			`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <composition-id> [output-location]`
		);
		quit(1);
	}

	const outName = args[2] ?? null;

	const {
		chromiumOptions,
		codec,
		crf,
		envVariables,
		frameRange,
		imageFormat,
		inputProps,
		logLevel,
		pixelFormat,
		proResProfile,
		puppeteerTimeout,
		quality,
		scale,
		everyNthFrame,
		numberOfGifLoops,
		muted,
	} = await CliInternals.getCliOptions({
		type: 'series',
		isLambda: true,
	});

	const functionName = await findFunctionName();

	const region = getAwsRegion();

	const maxRetries = parsedLambdaCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	validateMaxRetries(maxRetries);

	const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	validatePrivacy(privacy);
	const framesPerLambda = parsedLambdaCli['frames-per-lambda'] ?? undefined;
	validateFramesPerLambda(framesPerLambda);

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
		quality,
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
	});

	const totalSteps = outName ? 5 : 4;

	const progressBar = CliInternals.createOverwriteableCliOutput(
		CliInternals.quietFlagProvided()
	);

	Log.info(
		CliInternals.chalk.gray(
			`Bucket = ${res.bucketName}, renderId = ${res.renderId}, functionName = ${functionName}`
		)
	);
	Log.verbose(
		`CloudWatch logs (if enabled): ${getCloudwatchStreamUrl({
			functionName,
			region,
			renderId: res.renderId,
			method: LambdaRoutines.renderer,
		})}`
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
		})
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
			})
		);

		if (newStatus.done) {
			progressBar.update(
				makeProgressString({
					progress: newProgress,
					steps: totalSteps,
					downloadInfo: null,
					retriesInfo: newStatus.retriesInfo,
				})
			);
			if (outName) {
				const downloadStart = Date.now();
				const {outputPath, sizeInBytes} = await downloadMedia({
					bucketName: res.bucketName,
					outPath: outName,
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
							})
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
					})
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
			for (const err of newStatus.errors) {
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
				await CliInternals.handleCommonError(errorWithStackFrame);
			}

			quit(1);
		}
	}
};
