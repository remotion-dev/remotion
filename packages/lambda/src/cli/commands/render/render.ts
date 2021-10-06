import {CliInternals} from '@remotion/cli';
import {Internals} from 'remotion';
import {downloadVideo} from '../../../api/download-video';
import {getRenderProgress} from '../../../api/get-render-progress';
import {renderVideoOnLambda} from '../../../api/render-video-on-lambda';
import {
	BINARY_NAME,
	DEFAULT_FRAMES_PER_LAMBDA,
} from '../../../shared/constants';
import {sleep} from '../../../shared/sleep';
import {getAwsRegion} from '../../get-aws-region';
import {findFunctionName} from '../../helpers/find-function-name';
import {formatBytes} from '../../helpers/format-bytes';
import {Log} from '../../log';
import {
	makeChunkProgress,
	makeCleanupProgress,
	makeDownloadProgess,
	makeEncodingProgress,
	makeInvokeProgress,
	makeMultiProgressFromStatus,
} from './progress';

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
		region: getAwsRegion(),
		// TODO: Unhardcode retries
		maxRetries: 3,
		composition,
		framesPerLambda: cliOptions.framesPerLambda ?? DEFAULT_FRAMES_PER_LAMBDA,
	});

	const totalSteps = outName ? 5 : 4;

	const progressBar = CliInternals.createOverwriteableCliOutput();

	const status = await getRenderProgress({
		functionName,
		bucketName: res.bucketName,
		renderId: res.renderId,
		region: getAwsRegion(),
	});
	const multiProgress = makeMultiProgressFromStatus(status);
	progressBar.update(
		[
			makeInvokeProgress(multiProgress.lambdaInvokeProgress, totalSteps),
			makeChunkProgress(multiProgress.chunkProgress, totalSteps),
			makeEncodingProgress(multiProgress.encodingProgress, totalSteps),
			makeCleanupProgress(multiProgress.cleanupInfo, totalSteps),
		].join('\n')
	);

	for (let i = 0; i < 3000; i++) {
		await sleep(1000);
		const newStatus = await getRenderProgress({
			functionName,
			bucketName: res.bucketName,
			renderId: res.renderId,
			region: getAwsRegion(),
		});
		CliInternals.Log.verbose(JSON.stringify(newStatus, null, 2));
		const newProgress = makeMultiProgressFromStatus(newStatus);
		progressBar.update(
			[
				makeInvokeProgress(newProgress.lambdaInvokeProgress, totalSteps),
				makeChunkProgress(newProgress.chunkProgress, totalSteps),
				makeEncodingProgress(newProgress.encodingProgress, totalSteps),
				makeCleanupProgress(newProgress.cleanupInfo, totalSteps),
			]
				.filter(Internals.truthy)
				.join('\n')
		);

		//	Log.info(newStatus);
		if (newStatus.done) {
			progressBar.update(
				[
					makeInvokeProgress(newProgress.lambdaInvokeProgress, totalSteps),
					makeChunkProgress(newProgress.chunkProgress, totalSteps),
					makeEncodingProgress(newProgress.encodingProgress, totalSteps),
					makeCleanupProgress(newProgress.cleanupInfo, totalSteps),
				]
					.filter(Internals.truthy)
					.join('\n')
			);
			if (outName) {
				const {outputPath, size} = await downloadVideo({
					bucketName: res.bucketName,
					outPath: outName,
					region: getAwsRegion(),
					renderId: res.renderId,
				});
				progressBar.update(
					[
						makeInvokeProgress(newProgress.lambdaInvokeProgress, totalSteps),
						makeChunkProgress(newProgress.chunkProgress, totalSteps),
						makeEncodingProgress(newProgress.encodingProgress, totalSteps),
						makeCleanupProgress(newProgress.cleanupInfo, totalSteps),
						outName ? makeDownloadProgess(totalSteps, true) : null,
					]
						.filter(Internals.truthy)
						.join('\n')
				);
				Log.info();
				Log.info();
				Log.info('Done!', outputPath, formatBytes(size));
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
			Log.error(JSON.stringify(newStatus.errors));
			Log.error('Fatal error encountered. Exiting.');
			process.exit(1);
		}
	}
};
