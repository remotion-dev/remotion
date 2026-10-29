import {expect, test} from 'bun:test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
	RenderInternals,
	openBrowser,
	renderFrames,
	selectComposition,
	stitchFramesToVideo,
} from '@remotion/renderer';
import {PNG} from 'pngjs';

const exampleBuild = path.join(__dirname, '..', '..', '..', 'example', 'build');

test('Legacy SSR way of rendering videos should still work', async () => {
	const puppeteerInstance = await openBrowser('chrome');
	let framesDir: string | null = null;
	try {
		const reactSvg = await selectComposition({
			id: '22khz',
			serveUrl: exampleBuild,
			puppeteerInstance,
			inputProps: {},
		});

		const tmpDir = os.tmpdir();

		// We create a temporary directory for storing the frames
		const createdFramesDir = await fs.promises.mkdtemp(
			path.join(os.tmpdir(), 'remotion-'),
		);
		framesDir = createdFramesDir;

		const outPath = path.join(tmpDir, 'out.mp4');

		const {assetsInfo} = await renderFrames({
			composition: reactSvg,
			imageFormat: 'jpeg',
			inputProps: {},
			onFrameUpdate: () => undefined,
			serveUrl: exampleBuild,
			concurrency: null,
			frameRange: [0, 10],
			outputDir: createdFramesDir,
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
	} finally {
		if (framesDir !== null) {
			RenderInternals.deleteDirectory(framesDir);
		}

		await puppeteerInstance.close({silent: false});
	}
});

test('renderFrames() should render selected frames with HTML-in-canvas motion blur (#12656)', async () => {
	const puppeteerInstance = await openBrowser('chrome');
	const selectedFramesDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'remotion-selected-frames-'),
	);

	try {
		const tenFrameTester = await selectComposition({
			id: 'ten-frame-tester',
			serveUrl: exampleBuild,
			puppeteerInstance,
			inputProps: {},
		});

		const selectedFramesRender = await renderFrames({
			composition: tenFrameTester,
			frames: [5, 0, 2],
			imageFormat: 'png',
			inputProps: {},
			onFrameUpdate: () => undefined,
			serveUrl: exampleBuild,
			concurrency: null,
			outputDir: selectedFramesDir,
			onStart: () => undefined,
			puppeteerInstance,
		});

		expect(selectedFramesRender.frameCount).toBe(3);
		expect((await fs.promises.readdir(selectedFramesDir)).sort()).toEqual([
			'element-0.png',
			'element-2.png',
			'element-5.png',
		]);
		for (const frame of [0, 2, 5]) {
			const png = PNG.sync.read(
				await fs.promises.readFile(
					path.join(selectedFramesDir, `element-${frame}.png`),
				),
			);
			const left = 32 + frame * 32;
			// At frame 0 the earlier samples clamp to 0. Later frames include
			// four samples on either side, producing distinct blended edges.
			const probes =
				frame === 0
					? [
							[left + 1, 128],
							[left + 17, 255],
							[left + 29, 64],
						]
					: [
							[left - 13, 32],
							[left - 9, 64],
							[left + 3, 160],
						];
			for (const [x, red] of probes) {
				const offset = (30 * png.width + x) * 4;
				expect(
					Array.from(png.data.subarray(offset, offset + 4)),
					`motion blur at frame ${frame}, x=${x}`,
				).toEqual([red, 0, 0, 255]);
			}
		}
	} finally {
		RenderInternals.deleteDirectory(selectedFramesDir);
		await puppeteerInstance.close({silent: false});
	}
});

test('renderFrames() should await async frame buffer callbacks', async () => {
	const puppeteerInstance = await openBrowser('chrome');

	try {
		const scripts = await selectComposition({
			id: 'scripts',
			serveUrl: exampleBuild,
			puppeteerInstance,
			inputProps: {},
		});
		const completedFrames: number[] = [];
		let notifyFirstFrameReceived: () => void = () => {
			throw new Error('The first frame was not received.');
		};
		const firstFrameReceived = new Promise<void>((resolve) => {
			notifyFirstFrameReceived = resolve;
		});
		let releaseFirstFrame: () => void = () => {
			throw new Error('The first frame was not received.');
		};
		const firstFrameCanFinish = new Promise<void>((resolve) => {
			releaseFirstFrame = resolve;
		});

		const render = renderFrames({
			composition: scripts,
			frames: [0],
			imageFormat: 'jpeg',
			inputProps: {},
			onFrameUpdate: () => undefined,
			serveUrl: exampleBuild,
			concurrency: 1,
			outputDir: null,
			onStart: () => undefined,
			puppeteerInstance,
			onFrameBuffer: async (_buffer, frame) => {
				if (frame === 0) {
					notifyFirstFrameReceived();
					await firstFrameCanFinish;
				}

				completedFrames.push(frame);
			},
		});

		await firstFrameReceived;
		const stateWhileCallbackIsPending = await Promise.race([
			render.then(() => 'finished' as const),
			new Promise<'pending'>((resolve) => {
				setTimeout(() => resolve('pending'), 500);
			}),
		]);
		releaseFirstFrame();
		await render;

		expect(stateWhileCallbackIsPending).toBe('pending');
		expect(completedFrames).toEqual([0]);
	} finally {
		await puppeteerInstance.close({silent: false});
	}
});
