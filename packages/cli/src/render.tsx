import {bundle} from '@remotion/bundler';
import {TComposition, VideoConfig} from '@remotion/core';
import {openBrowser, provideScreenshot, stitchVideos} from '@remotion/renderer';
import cliProgress from 'cli-progress';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const render = async (fullPath: string, comps: TComposition[]) => {
	process.stdout.write('📦 (1/3) Bundling video...\n');
	const args = process.argv;
	const videoName = args[2];
	if (!(videoName || '').trim()) {
		console.log(
			'Pass an extra argument <video-name>. The following video names are available:'
		);
		console.log(`${comps.map((c) => c.name).join(', ')}`);
		process.exit(1);
	}
	const comp = comps.find((c) => c.name === videoName);

	if (!comp) {
		console.log(
			`Could not find video with the name ${videoName}. The following videos are available: `
		);
		console.log(`${comps.map((c) => c.name).join(', ')}`);
		process.exit(1);
	}
	const result = await bundle(fullPath);
	const config: VideoConfig = {
		durationInFrames: comp.durationInFrames,
		fps: comp.fps,
		height: comp.height,
		width: comp.width,
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
		const site = `file://${result}/index.html?composition=${videoName}&frame=${frame}`;
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
