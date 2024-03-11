import {RenderInternals} from '@remotion/renderer';
import fs, {createWriteStream} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterAll, expect, test} from 'vitest';
import {deleteRender} from '../../../api/delete-render';
import {rendersPrefix} from '../../../defaults';
import {lambdaLs} from '../../../functions/helpers/io';
import {simulateLambdaRender} from '../simulate-lambda-render';

afterAll(async () => {
	await RenderInternals.killAllBrowsers();
});

test('Should make a transparent video', async () => {
	const {close, file, progress, renderId} = await simulateLambdaRender({
		codec: 'vp8',
		composition: 'ten-frame-tester',
		frameRange: [0, 9],
		imageFormat: 'png',
		framesPerLambda: 5,
		logLevel: 'error',
		functionName: 'remotion-dev-render',
		region: 'eu-central-1',
		outName: 'out.webm',
		pixelFormat: 'yuva420p',
	});

	// We create a temporary directory for storing the frames
	const tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'remotion-'));
	const out = path.join(tmpdir, 'hithere.webm');
	file.pipe(createWriteStream(out));

	await new Promise<void>((resolve) => {
		file.on('close', () => resolve());
	});
	const probe = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [out],
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	expect(probe.stderr).toMatch(/ALPHA_MODE(\s+): 1/);
	expect(probe.stderr).toMatch(/Video: vp8, yuv420p/);
	expect(probe.stderr).toMatch(/Audio: opus, 48000 Hz/);
	fs.unlinkSync(out);

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

	RenderInternals.deleteDirectory(tmpdir);
	expect(expectFiles.length).toBe(0);

	await close();
});
