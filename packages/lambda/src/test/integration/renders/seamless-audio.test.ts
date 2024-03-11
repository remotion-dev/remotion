import {RenderInternals} from '@remotion/renderer';
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
		frameRange: [0, 9],
		imageFormat: 'png',
		framesPerLambda: 5,
		logLevel: 'error',
		region: 'eu-central-1',
	});

	const probe = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: ['-'],
		options: {
			stdin: file,
		},
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	expect(probe.stderr).toMatch(/Duration: 00:00:00.38/);

	const files = await lambdaLs({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: rendersPrefix(renderId),
	});

	expect(files.length).toBe(4);

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
