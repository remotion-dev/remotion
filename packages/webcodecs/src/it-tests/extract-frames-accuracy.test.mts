import {expect, test} from '@playwright/test';
import {WEBCODECS_TIMESCALE} from '@remotion/media-parser';
import path from 'path';
import type {ViteDevServer} from 'vite';
import {createServer} from 'vite';

let viteServer: ViteDevServer | undefined;

test.beforeAll(async () => {
	viteServer = await createServer({
		root: path.resolve(
			// @ts-expect-error
			new URL('.', import.meta.url).pathname,
			'extract-frames-accuracy',
		),
		logLevel: 'silent',
		build: {},
	});
	await viteServer.listen();
});

test.afterAll(async () => {
	if (viteServer) {
		await viteServer.close();
	}
});

test.describe('Should return correct frame even when it is out of order', () => {
	test('should execute vite script and set window property', async ({
		page,
	}, testInfo) => {
		if (testInfo.project.name === 'webkit') {
			// 				'Tolerating Webkit frame inaccuracy for now, this will be needed for browser rendering',
			test.skip();
			return;
		}
		// TODO: Make it work in GitHub Actions again
		if (process.env.CI) {
			test.skip();
			return;
		}
		await page.goto(
			'http://localhost:' + (viteServer?.config.server.port ?? 5173),
		);

		await page.waitForFunction(() => (window as any).done === true);
		const errors = await page.evaluate(() => (window as any).errors);
		if (errors.length > 0) {
			throw new Error(errors[0].message);
		}

		const value = await page.evaluate(() => (window as any).videoFrames);
		expect(value[0]).toBe(Math.floor((11 / 30) * WEBCODECS_TIMESCALE));
	});
});
