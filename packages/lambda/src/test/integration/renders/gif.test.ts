import {RenderInternals} from '@remotion/renderer';
import {createWriteStream, unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {afterAll, expect, test} from 'vitest';
import {simulateLambdaRender} from '../simulate-lambda-render';

afterAll(async () => {
	await RenderInternals.killAllBrowsers();
});

test('Should make a distributed GIF', async () => {
	const {file, close} = await simulateLambdaRender({
		codec: 'gif',
		composition: 'framer',
		// 61 frames, which is uneven, to challenge the frame planner
		frameRange: [0, 60],
		framesPerLambda: 8,
		imageFormat: 'png',
		logLevel: 'error',
		outName: 'out.gif',
		timeoutInMilliseconds: 12000,
		everyNthFrame: 2,
		region: 'eu-central-1',
	});

	const out = path.join(tmpdir(), 'gif.gif');

	await new Promise<void>((resolve) => {
		file.pipe(createWriteStream(out)).on('close', () => resolve());
	});
	const probe = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [out],
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	unlinkSync(out);
	expect(probe.stderr).toMatch(/Video: gif, bgra, 1080x1080/);

	await close();
}, 90000);
