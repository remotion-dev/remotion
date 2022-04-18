import puppeteer from 'puppeteer-core';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';

export const seekToFrame = async ({
	frame,
	page,
}: {
	frame: number;
	page: puppeteer.Page;
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
