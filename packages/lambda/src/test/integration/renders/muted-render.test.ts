import {expect, test} from 'bun:test';
import {createWriteStream, unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'path';
import {LambdaClientInternals} from '@remotion/lambda-client';
import {RenderInternals, getVideoMetadata} from '@remotion/renderer';
import {rendersPrefix, ServerlessRoutines} from '@remotion/serverless';
import {mockImplementation} from '../../mocks/mock-implementation';
import {getMockInvocationTypesForRender} from '../../mocks/mock-invocations';
import {simulateLambdaRender} from '../simulate-lambda-render';

test('Should directly make a muted render with one Lambda', async () => {
	const {close, file, progress, renderId} = await simulateLambdaRender({
		codec: 'h264',
		composition: 'framer',
		frameRange: [100, 110],
		imageFormat: 'jpeg',
		logLevel: 'verbose',
		region: 'eu-central-1',
		inputProps: {},
		muted: true,
		concurrency: 1,
	});

	const tmpfile = path.join(tmpdir(), 'out.mp4');

	await new Promise<void>((resolve) => {
		file.pipe(createWriteStream(tmpfile)).on('close', () => resolve());
	});

	// Make sure Faststart is supported
	const {supportsSeeking} = await getVideoMetadata(tmpfile);
	expect(supportsSeeking).toBe(true);

	const out = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [tmpfile],
		indent: false,
		binariesDirectory: null,
		cancelSignal: undefined,
		logLevel: 'error',
	});

	expect(out.stdout).not.toContain('Audio');
	expect(getMockInvocationTypesForRender(renderId)).toEqual([
		ServerlessRoutines.launch,
	]);
	expect(progress.renderMetadata?.estimatedTotalLambdaInvokations).toBe(1);
	expect(progress.renderMetadata?.estimatedRenderLambdaInvokations).toBe(0);

	unlinkSync(tmpfile);

	const files = await mockImplementation.listObjects({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: rendersPrefix(renderId),
		forcePathStyle: false,
		requestHandler: null,
	});

	expect(files.length).toBe(2);

	await LambdaClientInternals.internalDeleteRender({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		renderId,
		providerSpecifics: mockImplementation,
		forcePathStyle: false,
	});

	const expectFiles = await mockImplementation.listObjects({
		bucketName: progress.outBucket as string,
		region: 'eu-central-1',
		expectedBucketOwner: 'abc',
		prefix: rendersPrefix(renderId),
		forcePathStyle: false,
		requestHandler: null,
	});

	expect(expectFiles.length).toBe(0);

	await close();
});
