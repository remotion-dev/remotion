import {InvokeCommand} from '@aws-sdk/client-lambda';
import {renderFrames, stitchFramesToVideo} from '@remotion/renderer';
import fs, {copyFileSync, writeFileSync} from 'fs';
import path from 'path';
import {lambdaClient} from '../aws-clients';
import {
	EFS_MOUNT_PATH,
	ENABLE_EFS,
	LambdaPayload,
	LambdaPayloads,
	LambdaRoutines,
} from '../constants';
import {getBrowserInstance} from '../get-browser-instance';
import {lambdaWriteFile} from '../io';
import {timer} from '../timer';

const renderHandler = async (params: LambdaPayload) => {
	if (params.type !== LambdaRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

	const efsRemotionVideoRenderDone = EFS_MOUNT_PATH + '/render-done';
	const browserInstance = await getBrowserInstance();
	const outputDir = '/tmp/remotion-render-' + Math.random();
	if (fs.existsSync(outputDir)) {
		fs.rmdirSync(outputDir);
	}

	fs.mkdirSync(outputDir);

	if (typeof params.chunk !== 'number') {
		throw new Error('must pass chunk');
	}

	if (!params.frameRange) {
		throw new Error('must pass framerange');
	}

	if (ENABLE_EFS) {
		if (!fs.existsSync(params.efsRemotionVideoPath)) {
			fs.mkdirSync(params.efsRemotionVideoPath);
		}

		if (!fs.existsSync(efsRemotionVideoRenderDone)) {
			fs.mkdirSync(efsRemotionVideoRenderDone);
		}
	}

	console.log(`Started rendering ${params.chunk}, frame ${params.frameRange}`);
	await renderFrames({
		compositionId: params.composition,
		config: {
			durationInFrames: params.durationInFrames,
			fps: params.fps,
			height: params.height,
			width: params.width,
		},
		imageFormat: 'jpeg',
		inputProps: {},
		frameRange: params.frameRange,
		onFrameUpdate: (i: number, output: string) => {
			console.log('Rendered frames', i, output);
		},
		parallelism: 1,
		onStart: () => {
			console.log('Starting');
		},
		outputDir,
		puppeteerInstance: browserInstance,
		serveUrl: params.serveUrl,
	});
	const outdir = `/tmp/${Math.random()}`;
	fs.mkdirSync(outdir);

	const outputLocation = ENABLE_EFS
		? path.join(
				params.efsRemotionVideoPath,
				`chunk-${String(params.chunk).padStart(8, '0')}.mp4`
		  )
		: path.join(outdir, `chunk-${String(params.chunk).padStart(8, '0')}.mp4`);
	const outputFileLocation = path.join(
		efsRemotionVideoRenderDone,
		`chunk-${String(params.chunk).padStart(8, '0')}.txt`
	);

	const stitchLabel = timer('stitcher');
	await stitchFramesToVideo({
		assetsInfo: {
			// TODO
			assets: [],
			bundleDir: '',
		},
		dir: outputDir,
		force: true,
		fps: params.fps,
		height: params.height,
		width: params.width,
		outputLocation,
		// TODO
		codec: 'h264',
		// TODO
		imageFormat: 'jpeg',
	});
	stitchLabel.end();
	if (ENABLE_EFS) {
		const copying = timer('copying');
		copyFileSync(outputLocation, outputLocation);
		copying.end();

		const flag = timer('writing flag');
		writeFileSync(outputFileLocation, 'true');
		flag.end();
		console.log('Done rendering!', outputDir, outputLocation);
	} else {
		const uploading = timer('uploading');
		await lambdaWriteFile({
			bucketName: params.bucketName,
			key: `chunk-${String(params.chunk).padStart(8, '0')}.mp4`,
			body: fs.createReadStream(outputLocation),
		});
		uploading.end();
		console.log('Done rendering!', outputDir, outputLocation);
	}
};

export const rendererHandler = async (params: LambdaPayload) => {
	if (params.type !== LambdaRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

	try {
		await renderHandler(params);
	} catch (err) {
		// If this error is encountered, we can just retry as it
		// is a very rare error to occur
		if (
			err.message.includes('FATAL:zygote_communication_linux.cc') &&
			params.retriesLeft > 0
		) {
			const retryPayload: LambdaPayloads[LambdaRoutines.renderer] = {
				...params,
				retriesLeft: params.retriesLeft - 1,
			};
			await lambdaClient.send(
				new InvokeCommand({
					FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
					// @ts-expect-error
					Payload: JSON.stringify(retryPayload),
					InvocationType: 'Event',
				})
			);
		}

		console.log('Error occurred', err);
		await lambdaWriteFile({
			bucketName: params.bucketName,
			key: `error-chunk-${params.chunk}-${Date.now()}.txt`,
			body: JSON.stringify({
				error: err.message,
			}),
		});
	}
};
