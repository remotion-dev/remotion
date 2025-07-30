import {expect, test} from '@playwright/test';
import path from 'path';
import type {ViteDevServer} from 'vite';
import {createServer} from 'vite';

let viteServer: ViteDevServer | undefined;

test.beforeAll(async () => {
	viteServer = await createServer({
		root: path.resolve(
			// @ts-expect-error
			new URL('.', import.meta.url).pathname,
			'extract-frames',
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

test.describe('Vite app', () => {
	test('should execute vite script and set window property', async ({page}) => {
		await page.goto(
			'http://localhost:' + (viteServer?.config.server.port ?? 5173),
		);

		await page.waitForFunction(() => (window as any).videoFrames?.length === 5);
		const value = await page.evaluate(() => (window as any).videoFrames);
		expect(value[0]).toBe(0);
		expect(value[1] === 1000000 || value[1] === 920000).toBe(true);
		expect(value[2] === 2000000 || value[2] === 1880000).toBe(true);
		expect(value[3] === 3000000 || value[3] === 2840000).toBe(true);
		expect(value[4]).toBe(4_000_000);
	});
});
