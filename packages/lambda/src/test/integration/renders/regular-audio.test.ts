import {RenderInternals} from '@remotion/renderer';
import {createWriteStream, unlinkSync} from 'fs';
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
		codec: 'wav',
		composition: 'framer',
		frameRange: [300, 400],
		imageFormat: 'none',
		logLevel: 'error',
		region: 'eu-central-1',
		inputProps: {playbackRate: 1},
	});

	const wav = path.join(process.cwd(), 'regular.wav');
	await new Promise<void>((resolve) => {
		file.pipe(createWriteStream(wav)).on('finish', () => resolve());
	});

	const wd = new Wavedraw(wav);

	const snapShot = path.join(__dirname, 'regular-audio.png');

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
		filename: snapShot,
	};

	await wd.drawWave(options); // outputs wave drawing to example1.png

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

	unlinkSync(wav);
	await close();
});
