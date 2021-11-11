import {CliInternals} from '@remotion/cli';
import {downloadVideo} from '../../../api/download-video';
import {getRenderProgress} from '../../../api/get-render-progress';
import {renderVideoOnLambda} from '../../../api/render-video-on-lambda';
import {
	BINARY_NAME,
	DEFAULT_FRAMES_PER_LAMBDA,
	LambdaRoutines,
} from '../../../shared/constants';
import {sleep} from '../../../shared/sleep';
import {parsedLambdaCli} from '../../args';
import {getAwsRegion} from '../../get-aws-region';
import {findFunctionName} from '../../helpers/find-function-name';
import {formatBytes} from '../../helpers/format-bytes';
import {getCloudwatchStreamUrl} from '../../helpers/get-cloudwatch-stream-url';
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
		Log.info(`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <composition-id>`);
		process.exit(1);
	}

	const composition = args[1];
	if (!composition) {
		Log.error('No composition ID passed.');
		Log.info('Pass an additional argument specifying the composition ID.');
		Log.info();
		// TODO: Rename serveURL
		Log.info(`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <composition-id>`);
		process.exit(1);
	}

	const outName = args[2] ?? null;

	// TODO: Further validate serveUrl

	const cliOptions = await CliInternals.getCliOptions({
		type: 'series',
		isLambda: true,
	});

	const functionName = await findFunctionName();

	const region = getAwsRegion();

	const res = await renderVideoOnLambda({
		functionName,
		serveUrl,
		inputProps: cliOptions.inputProps,
		codec: cliOptions.codec as 'h264-mkv' | 'mp3' | 'aac' | 'wav',
		imageFormat: cliOptions.imageFormat,
		crf: cliOptions.crf ?? undefined,
		envVariables: cliOptions.envVariables,
		pixelFormat: cliOptions.pixelFormat,
		proResProfile: cliOptions.proResProfile,
		quality: cliOptions.quality,
		region,
		// TODO: Unhardcode retries
		maxRetries: 3,
		composition,
		framesPerLambda: cliOptions.framesPerLambda ?? DEFAULT_FRAMES_PER_LAMBDA,
		// TODO: Unhardcode and specify as parameter
		privacy: 'public',
		enableChunkOptimization: !parsedLambdaCli['disable-chunk-optimization'],
		saveBrowserLogs: parsedLambdaCli['save-browser-logs'],
	});

	const totalSteps = outName ? 5 : 4;

	const progressBar = CliInternals.createOverwriteableCliOutput();

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
			outName,
			errors: status.errors,
			steps: totalSteps,
			isDownloaded: false,
			retriesInfo: status.retriesInfo,
		})
	);

	for (let i = 0; i < 3000; i++) {
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
				outName,
				progress: newProgress,
				steps: totalSteps,
				isDownloaded: false,
				errors: newStatus.errors,
				retriesInfo: newStatus.retriesInfo,
			})
		);

		//	Log.info(newStatus);
		if (newStatus.done) {
			progressBar.update(
				makeProgressString({
					outName,
					progress: newProgress,
					steps: totalSteps,
					isDownloaded: false,
					errors: newStatus.errors,
					retriesInfo: newStatus.retriesInfo,
				})
			);
			if (outName) {
				const {outputPath, sizeInBytes} = await downloadVideo({
					bucketName: res.bucketName,
					outPath: outName,
					region: getAwsRegion(),
					renderId: res.renderId,
				});
				progressBar.update(
					makeProgressString({
						outName,
						progress: newProgress,
						steps: totalSteps,
						isDownloaded: true,
						errors: newStatus.errors,
						retriesInfo: newStatus.retriesInfo,
					})
				);
				Log.info();
				Log.info();
				Log.info('Done!', outputPath, formatBytes(sizeInBytes));
			} else {
				Log.info();
				Log.info();
				Log.info('Done! ' + newStatus.outputFile);
			}

			Log.info(
				`${newStatus.renderMetadata?.estimatedTotalLambdaInvokations} λ's used, Estimated cost $${newStatus.costs.displayCost}`
			);

			process.exit(0);
		}

		if (newStatus.fatalErrorEncountered) {
			Log.error('\n');
			for (const err of newStatus.errors) {
				const attemptString = `(Attempt ${err.attempt}/${err.totalAttempts})`;
				if (err.chunk === null) {
					Log.error('Error occured while preparing video: ' + attemptString);
				} else {
					Log.error(`Error occurred when rendering chunk ${err.chunk}:`);
				}

				Log.error(err.stack);
			}

			Log.error('Fatal error encountered. Exiting.');
			process.exit(1);
		}
	}
};
