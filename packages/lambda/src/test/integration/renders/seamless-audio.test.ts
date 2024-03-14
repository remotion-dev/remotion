import {RenderInternals} from '@remotion/renderer';
import {existsSync, unlinkSync} from 'fs';
import path from 'path';
import {afterAll, expect, test} from 'vitest';
import {deleteRender} from '../../../api/delete-render';
import {rendersPrefix} from '../../../defaults';
import {lambdaLs} from '../../../functions/helpers/io';
import {Wavedraw} from '../draw-wav';
import {simulateLambdaRender} from '../simulate-lambda-render';

afterAll(async () => {
	await RenderInternals.killAllBrowsers();
});

test('Should make seamless audio', async () => {
	const {close, file, progress, renderId} = await simulateLambdaRender({
		codec: 'aac',
		composition: 'framer',
		frameRange: [100, 200],
		imageFormat: 'png',
		logLevel: 'error',
		region: 'eu-central-1',
		inputProps: {playbackRate: 2},
	});

	const wav = path.join(process.cwd(), 'test.wav');
	if (existsSync(wav)) {
		unlinkSync(wav);
	}

	console.log('aac');
	await RenderInternals.callFf({
		bin: 'ffmpeg',
		args: ['-i', '-', '-y', wav],
		options: {
			stdin: file,
		},
		indent: false,
		binariesDirectory: null,
		cancelSignal: undefined,
		logLevel: 'info',
	});
	console.log('wav');

	const wd = new Wavedraw(wav);

	const options = {
		width: 600,
		height: 300,
		rms: true,
		maximums: true,
		average: false,
		start: 'START' as const,
		end: 'END' as const,
		colors: {
			maximums: '#0000ff',
			rms: '#659df7',
			background: '#ffffff',
		},
		filename: 'example1.png',
	};

	console.log('drawn');
	await wd.drawWave(options); // outputs wave drawing to example1.png
	console.log('drawn');

	const files = await lambdaLs({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: rendersPrefix(renderId),
	});

	expect(files.length).toBe(8);

	await deleteRender({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		renderId,
	});

	const expectFiles = await lambdaLs({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: rendersPrefix(renderId),
	});

	expect(expectFiles.length).toBe(0);

	await close();
});
