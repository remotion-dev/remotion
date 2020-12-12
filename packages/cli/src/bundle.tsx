import {bundle} from '@remotion/bundler';
import {evaluateRootForCompositions, getRoot} from '@remotion/core';
import {VideoConfig} from '@remotion/core/dist/video-config';
import {openBrowser, provideScreenshot, stitchVideos} from '@remotion/renderer';
import cliProgress from 'cli-progress';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const bundleCommand = async () => {
	process.stdout.write('📦 (1/3) Bundling video...\n');
	const args = process.argv;
	const argument = args[3];
	const fullPath = path.join(
		process.cwd(),
		'..',
		'example',
		'src',
		'index.tsx'
	);
	await import(fullPath);
	const result = await bundle(fullPath);
	const Root = getRoot();
	if (!Root) {
		return 'Did not specify Root';
	}
	const compositions = await evaluateRootForCompositions();
	if (!argument) {
		console.log('Usage: npm run render <composition-name>.');
		console.log(
			`The following composition names are available: ${compositions
				.map((c) => c.name)
				.join(', ')}`
		);
		return;
	}

	const composition = compositions.find((c) => c.name === argument);
	if (!composition) {
		console.log(`No composition with name ${argument} was found.`);
		console.log(
			`Following compositions are available: ${compositions
				.map((c) => c.name)
				.join(', ')}`
		);
		return;
	}
	const {durationInFrames, fps, height, width} = composition;
	const config: VideoConfig = {
		durationInFrames,
		fps,
		height,
		width,
	};
	process.stdout.write('📼 (2/3) Rendering frames...\n');
	const browser = await openBrowser();
	const page = await browser.newPage();
	const {durationInFrames: frames} = config;
	const outputDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-render')
	);
	console.log('Output dir', outputDir);
	const bar = new cliProgress.Bar(
		{clearOnComplete: true},
		cliProgress.Presets.shades_grey
	);
	bar.start(frames, 0);
	for (let frame = 0; frame < frames; frame++) {
		const site = `file://${result}/index.html?composition=${argument}&frame=${frame}`;
		await provideScreenshot(page, {
			output: path.join(outputDir, `element-${frame}.png`),
			site,
			height: config.height,
			width: config.width,
		});
		bar.update(frame);
	}
	bar.stop();
	await browser.close();
	process.stdout.write('🧵 (3/3) Stitching frames together...\n');
	await stitchVideos({
		dir: outputDir,
		width: config.width,
		height: config.height,
		fps: config.fps,
	});
	console.log('\n▶️ Your video is ready - hit play!');
	console.log(path.join(outputDir, 'test.mp4'));
};
