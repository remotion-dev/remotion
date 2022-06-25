import type puppeteer from 'puppeteer-core';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';

export const seekToFrame = async ({
	frame,
	page,
	pageIndex,
}: {
	frame: number;
	page: puppeteer.Page;
	pageIndex: number;
}) => {
	await page.waitForFunction('window.ready === true');
	await puppeteerEvaluateWithCatch({
		pageFunction: (f: number) => {
			window.remotion_setFrame[pageIndex](f);
		},
		args: [frame],
		frame,
		page,
	});
	await page.waitForFunction('window.ready === true');
	await page.evaluateHandle('document.fonts.ready');
};
