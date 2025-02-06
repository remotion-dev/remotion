import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {createWriteStream, unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {simulateLambdaRender} from '../simulate-lambda-render';

test('Should make a distributed GIF', async () => {
	const {file, close} = await simulateLambdaRender({
		codec: 'gif',
		composition: 'framer',
		// 25 frames, which is uneven, to challenge the frame planner
		frameRange: [0, 24],
		framesPerLambda: 8,
		imageFormat: 'png',
		logLevel: 'error',
		outName: 'out.gif',
		timeoutInMilliseconds: 12000,
		everyNthFrame: 2,
		scale: 0.25,
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
	expect(probe.stderr).toMatch(/Video: gif, bgra, 270x270/);

	await close();
}, 90000);
