import xns from 'xns';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
	bundle,
	provideScreenshot,
	openBrowser,
	stitchVideos,
} from '@jonny/motion-renderer';

xns(async () => {
	const result = await bundle();
	const browser = await openBrowser();
	const page = await browser.newPage();
	const frames = 30;
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
		width: 1080,
		height: 1080,
		fps: 60,
	});
	console.log(path.join(outputDir, 'test.mp4'));
	return result;
});
