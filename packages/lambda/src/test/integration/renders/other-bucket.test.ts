import {RenderInternals} from '@remotion/renderer';
import {afterAll, expect, test} from 'vitest';
import {simulateLambdaRender} from '../simulate-lambda-render';

afterAll(async () => {
	await RenderInternals.killAllBrowsers();
});

test('Should be able to render to another bucket, and silent audio should be added', async () => {
	const {close, file} = await simulateLambdaRender({
		codec: 'h264',
		composition: 'react-svg',
		crf: 9,
		frameRange: [0, 12],
		framesPerLambda: 8,
		logLevel: 'error',
		outName: {
			bucketName: 'my-other-bucket',
			key: 'my-key',
		},
		functionName: 'remotion-dev-render',
		region: 'eu-central-1',
	});

	const probe = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: ['-'],
		indent: false,
		logLevel: 'info',
		options: {
			stdin: file,
		},
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	expect(probe.stderr).toMatch(/Stream #0:0/);
	expect(probe.stderr).toMatch(/Video: h264/);
	expect(probe.stderr).toMatch(/Stream #0:1/);
	expect(probe.stderr).toMatch(/Audio: aac/);

	await close();
});
