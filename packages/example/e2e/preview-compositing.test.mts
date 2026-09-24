import {expect, test} from '@playwright/test';
import {STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test('keeps the scaled composition on its own compositing layer', async ({
	page,
}) => {
	await startStudio();
	try {
		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);
		const preview = page.locator(
			'.remotion-studio-composition-container > div',
		);
		await expect(preview).toBeVisible();
		await expect(preview).toHaveCSS('will-change', 'opacity');
	} finally {
		await stopStudio();
	}
});
