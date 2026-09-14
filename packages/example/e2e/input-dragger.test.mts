import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('Input dragger', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('keeps input mode when tabbing to the next input dragger', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);

		const widthButton = page.getByRole('button', {name: 'Width'});
		await expect(widthButton).toBeVisible({timeout: 15_000});
		await widthButton.click();

		const widthInput = page.getByRole('textbox', {name: 'Width'});
		await expect(widthInput).toBeFocused();
		await widthInput.press('Tab');

		await expect(page.getByRole('textbox', {name: 'Height'})).toBeFocused();
	});
});
