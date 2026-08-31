import fs from 'fs';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, rootFile, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('Composition duration preset', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('matches the composition duration to the unclipped timeline end', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/duration-preset-e2e`);
		await expect(page).toHaveURL(/duration-preset-e2e/, {timeout: 15_000});

		if (!(await page.getByRole('button', {name: 'Inspector'}).isVisible())) {
			await page.locator('[data-sidebar-toggle="right"]').click();
		}

		const durationLabel = page.getByText('Duration', {exact: true});
		await expect(durationLabel).toBeVisible({timeout: 15_000});
		await durationLabel.hover();
		await page.getByRole('button', {name: 'Choose duration preset'}).click();
		await page.getByText('Match timeline (120 frames)', {exact: true}).click();

		const durationInput = page.getByRole('button', {
			name: 'Duration',
			exact: true,
		});
		await expect(durationInput).toContainText('120 frames', {timeout: 15_000});
		await expect
			.poll(() => {
				const source = fs.readFileSync(rootFile, 'utf-8');
				const compositionStart = source.indexOf('id="duration-preset-e2e"');
				const compositionEnd = source.indexOf('/>', compositionStart);
				return source.slice(compositionStart, compositionEnd);
			})
			.toContain('durationInFrames={120}');
	});
});
