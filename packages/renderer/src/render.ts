import path from 'path';
import {VideoConfig} from 'remotion';
import {openBrowser, provideScreenshot} from '.';
import {getActualConcurrency} from './get-concurrency';
import {DEFAULT_IMAGE_FORMAT, ImageFormat} from './image-format';

export const renderFrames = async ({
	config,
	parallelism,
	onFrameUpdate,
	compositionId: compositionId,
	outputDir,
	onStart,
	userProps,
	webpackBundle,
	quality,
	imageFormat = DEFAULT_IMAGE_FORMAT,
}: {
	config: VideoConfig;
	parallelism?: number | null;
	onFrameUpdate: (f: number) => void;
	onStart: () => void;
	compositionId: string;
	outputDir: string;
	userProps: unknown;
	webpackBundle: string;
	imageFormat?: ImageFormat;
	quality?: number;
}) => {
	if (quality !== undefined && imageFormat !== 'jpeg') {
		throw new Error(
			"You can only pass the `quality` option if `imageFormat` is 'jpeg'."
		);
	}
	const actualParallelism = getActualConcurrency(parallelism ?? null);
	const busyPages = new Array(actualParallelism).fill(true).map(() => false);
	const getBusyPages = () => busyPages;

	const browser = await openBrowser();
	const pages = await Promise.all(
		new Array(actualParallelism).fill(true).map(() => browser.newPage())
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
	onStart();
	await Promise.all(
		new Array(frames)
			.fill(Boolean)
			.map((x, i) => i)
			.map(async (f) => {
				const freePageIdx = await getFreePage();
				try {
					const freePage = pages[freePageIdx];
					const site = `file://${webpackBundle}/index.html?composition=${compositionId}&frame=${f}&props=${encodeURIComponent(
						JSON.stringify(userProps)
					)}`;
					await provideScreenshot({
						page: freePage,
						options: {
							output: path.join(outputDir, `element-${f}.${imageFormat}`),
							site,
							height: config.height,
							width: config.width,
						},
						imageFormat,
					});
				} catch (err) {
					console.log('Error taking screenshot', err);
				} finally {
					freeUpPage(freePageIdx);
					framesRendered++;
					onFrameUpdate(framesRendered);
				}
			})
	);
	await browser.close();
};
