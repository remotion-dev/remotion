import {bundle} from '@remotion/bundler';
import {openBrowser, provideScreenshot, stitchVideos} from '@remotion/renderer';
import cliProgress from 'cli-progress';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {TComposition, VideoConfig} from 'remotion';

const parallelism = 3;
const busyPages = new Array(parallelism).fill(true).map(() => false);
const getBusyPages = () => busyPages;

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
	const browsers = await Promise.all(
		new Array(parallelism).fill(true).map(() => openBrowser())
	);
	const pages = await Promise.all(
		browsers.map((b) => {
			return b.newPage();
		})
	);
	const getFreePage = () =>
		new Promise<number>((resolve) => {
			let interval: number | null = null;
			const resolveIfFree = () => {
				const freePage = getBusyPages().findIndex((p) => p === false);
				if (freePage !== -1) {
					busyPages[freePage] = true;
					resolve(freePage);
					if (interval) {
						clearInterval(interval);
					}
				} else {
					interval = setTimeout(resolveIfFree, 100);
				}
			};
			resolveIfFree();
		});
	const freeUpPage = (index: number) => {
		busyPages[index] = false;
	};
	const {durationInFrames: frames} = config;
	const outputDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-render')
	);
	const bar = new cliProgress.Bar(
		{clearOnComplete: true},
		cliProgress.Presets.shades_grey
	);
	bar.start(frames, 0);
	let framesRendered = 0;
	await Promise.all(
		new Array(frames)
			.fill(Boolean)
			.map((x, i) => i)
			.map(async (f) => {
				const freePageIdx = await getFreePage();
				const freePage = pages[freePageIdx];
				const site = `file://${result}/index.html?composition=${videoName}&frame=${f}`;
				await provideScreenshot(freePage, {
					output: path.join(outputDir, `element-${f}.png`),
					site,
					height: config.height,
					width: config.width,
				});
				freeUpPage(freePageIdx);
				framesRendered++;
				bar.update(framesRendered);
			})
	);
	bar.stop();
	await Promise.all(browsers.map((browser) => browser.close()));
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
