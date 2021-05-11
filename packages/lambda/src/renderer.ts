import {PutObjectCommand} from '@aws-sdk/client-s3';
import {renderFrames, stitchFramesToVideo} from '@remotion/renderer';
import fs, {copyFileSync, writeFileSync} from 'fs';
import path from 'path';
import {s3Client} from './aws-clients';
import {
	EFS_MOUNT_PATH,
	ENABLE_EFS,
	LambdaPayload,
	LambdaRoutines,
} from './constants';
import {getBrowserInstance} from './get-browser-instance';
import {timer} from './timer';

export const rendererHandler = async (params: LambdaPayload) => {
	const efsRemotionVideoRenderDone = EFS_MOUNT_PATH + '/render-done';
	const browserInstance = await getBrowserInstance();
	const outputDir = '/tmp/' + 'remotion-render-' + Math.random();
	if (fs.existsSync(outputDir)) {
		fs.rmdirSync(outputDir);
	}

	fs.mkdirSync(outputDir);

	if (params.type !== LambdaRoutines.renderer) {
		throw new Error('Params must be renderer');
	}

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
		await s3Client.send(
			new PutObjectCommand({
				Bucket: params.bucketName,
				Key: `chunk-${String(params.chunk).padStart(8, '0')}.mp4`,
				Body: fs.createReadStream(outputLocation),
			})
		);
		uploading.end();
		console.log('Done rendering!', outputDir, outputLocation);
	}
};
