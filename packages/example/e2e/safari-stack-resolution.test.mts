import {expect, test, webkit} from '@playwright/test';
import {STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test('resolves editable component stacks in Safari', async () => {
	await startStudio();
	const browser = await webkit.launch({headless: true});

	try {
		const page = await browser.newPage();
		const subscription = page.waitForRequest(
			(request) => {
				if (!request.url().includes('/api/subscribe-to-sequence-props')) {
					return false;
				}

				const body = request.postDataJSON() as {fileName: string};
				return body.fileName === './src/NewVideo.tsx';
			},
			{timeout: 15_000},
		);

		await page.goto(`${STUDIO_URL}/NewVideo`);
		const request = await subscription;
		const body = request.postDataJSON() as {
			column: number;
			componentIdentity: string;
			fileName: string;
			line: number;
		};

		expect(body).toMatchObject({
			componentIdentity: 'dev.remotion.media.Video',
			fileName: './src/NewVideo.tsx',
		});
		expect(body.line).toBeGreaterThan(0);
		expect(body.column).toBeGreaterThan(0);
	} finally {
		await browser.close();
		await stopStudio();
	}
});
