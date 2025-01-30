import {
	RenderInternals,
	getCompositions,
	openBrowser,
	renderFrames,
	stitchFramesToVideo,
} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import fs from 'fs';
import os from 'os';
import path from 'path';

test('Legacy SSR way of rendering videos should still work', async () => {
	const puppeteerInstance = await openBrowser('chrome');
	const compositions = await getCompositions(
		'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
		{
			puppeteerInstance,
			inputProps: {},
		},
	);

	const reactSvg = compositions.find((c) => c.id === '22khz');

	if (!reactSvg) {
		throw new Error('not found');
	}

	const tmpDir = os.tmpdir();

	// We create a temporary directory for storing the frames
	const framesDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'remotion-'),
	);

	const outPath = path.join(tmpDir, 'out.mp4');

	const {assetsInfo} = await renderFrames({
		composition: reactSvg,
		imageFormat: 'jpeg',
		inputProps: {},
		onFrameUpdate: () => undefined,
		serveUrl:
			'https://661808694cad562ef2f35be7--incomparable-dasik-a4482b.netlify.app/',
		concurrency: null,
		frameRange: [0, 10],
		outputDir: framesDir,
		onStart: () => undefined,
	});
	await stitchFramesToVideo({
		assetsInfo,
		force: true,
		fps: reactSvg.fps,
		height: reactSvg.height,
		outputLocation: outPath,
		width: reactSvg.width,
		codec: 'h264',
		metadata: {Author: 'Lunar'},
	});
	expect(fs.existsSync(outPath)).toBe(true);
	const probe = await RenderInternals.callFf({
		bin: 'ffprobe',
		args: [outPath],
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
		cancelSignal: undefined,
	});
	expect(probe.stderr).toMatch(/Video: h264/);

	RenderInternals.deleteDirectory(framesDir);
	await puppeteerInstance.close({silent: false});
});
