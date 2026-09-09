import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test('shows editable and computed text in the inspector', async ({page}) => {
	try {
		await startStudio();
		await page.goto(`${STUDIO_URL}/interactive-html-elements`);
		await expect(async () => {
			await page
				.locator('[data-timeline-marquee-item][title="Editable text"]')
				.click();
			await expect(page.getByRole('textbox')).toHaveValue(
				'Editable text schema',
				{
					timeout: 1_000,
				},
			);
		}).toPass({timeout: 30_000});
		await expect(page.getByRole('textbox')).toBeEditable();

		await page
			.locator('[data-timeline-marquee-item][title="Mixed text (computed)"]')
			.click();
		await expect(page.getByText('computed', {exact: true})).toBeVisible();
	} finally {
		await stopStudio();
	}
});
