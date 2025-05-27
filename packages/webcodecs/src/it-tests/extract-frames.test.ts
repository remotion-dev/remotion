import {expect, test} from '@playwright/test';
import path from 'path';
import type {ViteDevServer} from 'vite';
import {createServer} from 'vite';

let viteServer: ViteDevServer | undefined;

test.describe('Vite app', () => {
	test.beforeAll(async () => {
		viteServer = await createServer({
			root: path.resolve(__dirname, 'extract-frames'),
			server: {port: 5173},
		});
		await viteServer.listen();
	});

	test.afterAll(async () => {
		if (viteServer) {
			await viteServer.close();
		}
	});

	test('should execute vite script and set window property', async ({page}) => {
		console.log(viteServer?.config.server.port);
		await page.goto('http://localhost:' + viteServer?.config.server.port);
		await page.waitForFunction(() => (window as any).videoFrames?.length === 4);
		const value = await page.evaluate(() => (window as any).__viteTestValue);
		expect(value).toBe('hello from vite!');
	});
});
