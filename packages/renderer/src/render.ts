import {bundle} from '@remotion/bundler';
import path from 'path';
import {VideoConfig} from 'remotion';
import {openBrowser, provideScreenshot} from '.';

export const renderFrames = async ({
	fullPath,
	config,
	parallelism,
	onFrameUpdate,
	videoName,
	outputDir,
}: {
	fullPath: string;
	config: VideoConfig;
	parallelism: number;
	onFrameUpdate: (f: number) => void;
	videoName: string;
	outputDir: string;
}) => {
	const busyPages = new Array(parallelism).fill(true).map(() => false);
	const getBusyPages = () => busyPages;

	const result = await bundle(fullPath);
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
			let interval: number | NodeJS.Timeout | null = null;
			const resolveIfFree = () => {
				const freePage = getBusyPages().findIndex((p) => p === false);
				if (freePage !== -1) {
					busyPages[freePage] = true;
					resolve(freePage);
					if (interval) {
						clearInterval(interval as number);
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
				onFrameUpdate(framesRendered);
			})
	);
	await Promise.all(browsers.map((browser) => browser.close()));
};
