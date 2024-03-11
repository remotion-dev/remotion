import {RenderInternals} from '@remotion/renderer';
import path from 'path';
import {afterAll, expect, test} from 'vitest';
import {deleteRender} from '../../../api/delete-render';
import {rendersPrefix} from '../../../defaults';
import {lambdaLs} from '../../../functions/helpers/io';
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
	});

	const wav = path.join(process.cwd(), 'test.wav');

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
