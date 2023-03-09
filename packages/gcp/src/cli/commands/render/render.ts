import {CliInternals} from '@remotion/cli';
import {getCompositions} from '@remotion/renderer';
// import {downloadMedia} from '../../../api/download-media';
// import {getRenderProgress} from '../../../api/get-render-progress';
import {renderMediaOnGcp} from '../../../api/render-media-on-gcp';
// import type {EnhancedErrorInfo} from '../../../functions/helpers/write-lambda-error';
// import type {RenderProgress} from '../../../shared/constants';
import {BINARY_NAME, DEFAULT_MAX_RETRIES} from '../../../shared/constants';
// import {sleep} from '../../../shared/sleep';
import type {GcpCodec} from '../../../shared/validate-gcp-codec';
import {validateMaxRetries} from '../../../shared/validate-retries';
import {validateServeUrl} from '../../../shared/validate-serveurl';
import {parsedGcpCli} from '../../args';
import {quit} from '../../helpers/quit';
import {Log} from '../../log';
// import {makeMultiProgressFromStatus, makeProgressString} from './progress';

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

	let composition: string = args[1];
	if (!composition) {
		Log.info('No compositions passed. Fetching compositions...');

		validateServeUrl(serveUrl);
		const comps = await getCompositions(serveUrl);
		const {compositionId} = await CliInternals.selectComposition(comps);
		composition = compositionId;
	}

	const outName = parsedGcpCli['out-name'] ?? 'out.mp4'; // Todo, workout file extension instead of assuming mp4
	const downloadName = args[2] ?? null;

	const {codec, reason} = CliInternals.getFinalCodec({
		downloadName,
		outName: outName ?? null,
	});

	const {inputProps} = await CliInternals.getCliOptions({
		type: 'series',
		isLambda: true, // TODO: what do I need to do with this?
		remotionRoot,
	});
	const maxRetries = parsedGcpCli['max-retries'] ?? DEFAULT_MAX_RETRIES;
	validateMaxRetries(maxRetries);

	// const privacy = parsedLambdaCli.privacy ?? DEFAULT_OUTPUT_PRIVACY;
	// validatePrivacy(privacy);

	const outputBucket = parsedGcpCli['output-bucket']; // Todo: I think this should be optional with a fallback
	const outputFolderPath = parsedGcpCli['output-folder-path']; // Todo: I think this should be optional with a fallback

	const res = await renderMediaOnGcp({
		cloudRunUrl: 'https://new-two-tv4h6muxbq-ts.a.run.app',
		// serviceName,
		serveUrl,
		composition,
		inputProps,
		codec: codec as GcpCodec,
		outputBucket,
		outputFolderPath,
		outName,
	});

	// const totalSteps = downloadName ? 6 : 5;

	// const progressBar = CliInternals.createOverwriteableCliOutput(
	// 	CliInternals.quietFlagProvided()
	// );

	Log.info(
		CliInternals.chalk.gray(
			`bucket = ${res.bucketName}, serveUrl = ${serveUrl}` // ToDo: use serviceName if available
		)
	);
	Log.info(
		CliInternals.chalk.gray(
			`renderId = ${res.renderId}, codec = ${codec} (${reason})`
		)
	);
	// const verbose = RenderInternals.isEqualOrBelowLogLevel(
	// 	ConfigInternals.Logging.getLogLevel(),
	// 	'verbose'
	// );

	// Log.verbose(`CloudWatch logs (if enabled): ${res.cloudWatchLogs}`);
	Log.verbose(`Render folder: ${res.folderInGcpConsole}`);
	// const status = await getRenderProgress({
	// 	functionName,
	// 	bucketName: res.bucketName,
	// 	renderId: res.renderId,
	// 	region: getAwsRegion(),
	// });
	// const multiProgress = makeMultiProgressFromStatus(status);
	// progressBar.update(
	// 	makeProgressString({
	// 		progress: multiProgress,
	// 		steps: totalSteps,
	// 		downloadInfo: null,
	// 		retriesInfo: status.retriesInfo,
	// 		verbose,
	// 		totalFrames: getTotalFrames(status),
	// 		timeToEncode: status.timeToEncode,
	// 	})
	// );

	// eslint-disable-next-line no-constant-condition
	// while (true) {
	// 	await sleep(1000);
	// 	const newStatus = await getRenderProgress({
	// 		functionName,
	// 		bucketName: res.bucketName,
	// 		renderId: res.renderId,
	// 		region: getAwsRegion(),
	// 	});
	// 	const newProgress = makeMultiProgressFromStatus(newStatus);
	// 	progressBar.update(
	// 		makeProgressString({
	// 			progress: newProgress,
	// 			steps: totalSteps,
	// 			retriesInfo: newStatus.retriesInfo,
	// 			downloadInfo: null,
	// 			verbose,
	// 			timeToEncode: newStatus.timeToEncode,
	// 			totalFrames: getTotalFrames(newStatus),
	// 		})
	// 	);

	// 	if (newStatus.done) {
	// 		progressBar.update(
	// 			makeProgressString({
	// 				progress: newProgress,
	// 				steps: totalSteps,
	// 				downloadInfo: null,
	// 				retriesInfo: newStatus.retriesInfo,
	// 				verbose,
	// 				timeToEncode: newStatus.timeToEncode,
	// 				totalFrames: getTotalFrames(newStatus),
	// 			})
	// 		);
	// 		if (downloadName) {
	// 			const downloadStart = Date.now();
	// 			const {outputPath, sizeInBytes} = await downloadMedia({
	// 				bucketName: res.bucketName,
	// 				outPath: downloadName,
	// 				region: getAwsRegion(),
	// 				renderId: res.renderId,
	// 				onProgress: ({downloaded, totalSize}) => {
	// 					progressBar.update(
	// 						makeProgressString({
	// 							progress: newProgress,
	// 							steps: totalSteps,
	// 							retriesInfo: newStatus.retriesInfo,
	// 							downloadInfo: {
	// 								doneIn: null,
	// 								downloaded,
	// 								totalSize,
	// 							},
	// 							verbose,
	// 							timeToEncode: newStatus.timeToEncode,
	// 							totalFrames: getTotalFrames(newStatus),
	// 						})
	// 					);
	// 				},
	// 			});
	// 			progressBar.update(
	// 				makeProgressString({
	// 					progress: newProgress,
	// 					steps: totalSteps,
	// 					retriesInfo: newStatus.retriesInfo,
	// 					downloadInfo: {
	// 						doneIn: Date.now() - downloadStart,
	// 						downloaded: sizeInBytes,
	// 						totalSize: sizeInBytes,
	// 					},
	// 					verbose,
	// 					timeToEncode: newStatus.timeToEncode,
	// 					totalFrames: getTotalFrames(newStatus),
	// 				})
	// 			);
	// 			Log.info();
	// 			Log.info();
	// 			Log.info('Done!', outputPath, CliInternals.formatBytes(sizeInBytes));
	// 		} else {
	// 			Log.info();
	// 			Log.info();
	// 			Log.info('Done! ' + newStatus.outputFile);
	// 		}

	// 		Log.info(
	// 			[
	// 				newStatus.renderMetadata
	// 					? `${newStatus.renderMetadata.estimatedTotalLambdaInvokations} λ's used`
	// 					: null,
	// 				newStatus.timeToFinish
	// 					? `${(newStatus.timeToFinish / 1000).toFixed(2)}sec`
	// 					: null,
	// 				`Estimated cost $${newStatus.costs.displayCost}`,
	// 			]
	// 				.filter(Boolean)
	// 				.join(', ')
	// 		);
	// 		if (newStatus.mostExpensiveFrameRanges) {
	// 			Log.verbose('Most expensive frame ranges:');
	// 			Log.verbose(
	// 				newStatus.mostExpensiveFrameRanges
	// 					.map((f) => {
	// 						return `${f.frameRange[0]}-${f.frameRange[1]} (${f.timeInMilliseconds}ms)`;
	// 					})
	// 					.join(', ')
	// 			);
	// 		}

	// 		quit(0);
	// 	}

	// 	if (newStatus.fatalErrorEncountered) {
	// 		Log.error('\n');
	// 		const uniqueErrors: EnhancedErrorInfo[] = [];
	// 		for (const err of newStatus.errors) {
	// 			if (uniqueErrors.find((e) => e.stack === err.stack)) {
	// 				continue;
	// 			}

	// 			uniqueErrors.push(err);
	// 			if (err.explanation) {
	// 				Log.error(err.explanation);
	// 			}

	// 			const frames = RenderInternals.parseStack(err.stack.split('\n'));

	// 			const errorWithStackFrame = new RenderInternals.SymbolicateableError({
	// 				message: err.message,
	// 				frame: err.frame,
	// 				name: err.name,
	// 				stack: err.stack,
	// 				stackFrame: frames,
	// 			});
	// 			await CliInternals.handleCommonError(errorWithStackFrame);
	// 		}

	// 		quit(1);
	// 	}
	// }
};

// function getTotalFrames(status: RenderProgress): number | null {
// 	return status.renderMetadata
// 		? RenderInternals.getFramesToRender(
// 				status.renderMetadata.frameRange,
// 				status.renderMetadata.everyNthFrame
// 		  ).length
// 		: null;
// }
