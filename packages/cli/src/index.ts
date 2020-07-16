import xns from 'xns';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
	provideScreenshot,
	openBrowser,
	stitchVideos,
} from '@jonny/motion-renderer';
import {bundle} from '@jonny/motion-bundler';
import {getVideoConfig} from '@jonny/motion-core';

xns(async () => {
	const args = process.argv;
	const file = args[2];
	const fullPath = path.join(process.cwd(), file);
	await import(fullPath);
	const config = getVideoConfig();
	const result = await bundle(fullPath);
	const browser = await openBrowser();
	const page = await browser.newPage();
	const {frames} = config;
	const outputDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-render')
	);
	for (let frame = 0; frame < frames; frame++) {
		process.env.MOTION_FRAME = String(frame);
		await provideScreenshot(page, {
			output: path.join(outputDir, `element-${frame}.png`),
			site: 'file://' + result + '/index.html?frame=' + frame,
		});
		console.log('Rendered frame ' + frame);
	}
	await browser.close();
	await stitchVideos({
		dir: outputDir,
		width: config.width,
		height: config.height,
		fps: config.fps,
	});
	console.log(path.join(outputDir, 'test.mp4'));
	return result;
});
