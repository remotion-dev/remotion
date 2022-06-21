import {Page} from './browser/Page';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';

export const seekToFrame = async ({
	frame,
	page,
}: {
	frame: number;
	page: Page;
}) => {
	await page.waitForFunction('window.ready === true');
	await puppeteerEvaluateWithCatch({
		pageFunction: (f: number) => {
			window.remotion_setFrame(f);
		},
		args: [frame],
		frame,
		page,
	});
	await page.waitForFunction('window.ready === true');
	await page.evaluateHandle('document.fonts.ready');
};
