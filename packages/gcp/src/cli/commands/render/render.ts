import {CliInternals} from '@remotion/cli';
import {getCompositions} from '@remotion/renderer';
// import {downloadMedia} from '../../../api/download-media';
// import {getRenderProgress} from '../../../api/get-render-progress';
import {renderMediaOnGcp} from '../../../api/render-media-on-gcp';
// import type {EnhancedErrorInfo} from '../../../functions/helpers/write-lambda-error';
// import type {RenderProgress} from '../../../shared/constants';
import {BINARY_NAME, DEFAULT_MAX_RETRIES} from '../../../shared/constants';
// import {sleep} from '../../../shared/sleep';
import type {
	RenderMediaOnGcpErrOutput,
	RenderMediaOnGcpOutput,
} from '../../../api/render-media-on-gcp';
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
			`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <cloud-run-url> <composition-id> [output-location]`
		);
		quit(1);
	}

	const cloudRunUrl = args[1];
	if (!cloudRunUrl) {
		Log.error('No Cloud Run Service URL passed.');
		Log.info(
			'Pass an additional argument specifying a the endpoint of your Cloud Run Service.'
		);
		Log.info();
		Log.info(
			`${BINARY_NAME} ${RENDER_COMMAND} <serve-url> <cloud-run-url> <composition-id> [output-location]`
		);
		quit(1);
	}

	let composition: string = args[2];
	if (!composition) {
		Log.info(
			`<serve-url> passed: ${serveUrl} 
<cloud-run-url> passed: ${cloudRunUrl}`
		);
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

	const outputBucket =
		parsedGcpCli['output-bucket'] || 'remotioncloudrun-n8x4pc7dz3'; // Todo: I think this should be optional with a fallback

	// Todo: Check cloudRunUrl is valid, as the error message is obtuse
	CliInternals.Log.info(
		CliInternals.chalk.gray(
			`
Sending request to Cloud Run:

    Cloud Run Service URL = ${cloudRunUrl}
    Type = media
    Composition = ${composition}
    Codec = ${codec}
    Output Bucket = ${outputBucket}
    Output File = ${outName}
			`.trim()
		)
	);
	Log.info();
	const res = await renderMediaOnGcp({
		cloudRunUrl,
		// serviceName,
		serveUrl,
		composition,
		inputProps,
		codec: codec as GcpCodec,
		outputBucket,
		outputFile: outName,
	});

	if (res.status === 'error') {
		const err = res as RenderMediaOnGcpErrOutput;
		Log.error(CliInternals.chalk.red(err.message));
		throw err.error;
	} else {
		const success = res as RenderMediaOnGcpOutput;
		Log.info(
			CliInternals.chalk.blueBright(
				`
	🤘 Rendered on Cloud Run! 🤘
	
      Public URL = ${success.publicUrl}
      Cloud Storage Uri = ${success.cloudStorageUri}
      Size (KB) = ${Math.round(Number(success.size) / 1000)}
      Bucket Name = ${success.bucketName}
      Render ID = ${success.renderId}
      `.trim()
			)
		);
	}

	// const totalSteps = downloadName ? 6 : 5;

	// const progressBar = CliInternals.createOverwriteableCliOutput(
	// 	CliInternals.quietFlagProvided()
	// );

	// Log.verbose(`CloudWatch logs (if enabled): ${res.cloudWatchLogs}`);
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
