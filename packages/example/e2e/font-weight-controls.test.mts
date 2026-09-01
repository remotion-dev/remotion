import fs from 'fs';
import path from 'path';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

const compositionFile = path.join(
	exampleDir,
	'src',
	'VisualModeTests',
	'FontWeightControls.tsx',
);

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('font weight controls', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('edits numeric, string, and keyword font weights without changing their types', async ({
		page,
	}) => {
		const originalSource = fs.readFileSync(compositionFile, 'utf-8');

		try {
			await page.goto(`${STUDIO_URL}/font-weight-controls`);
			await expect(page).toHaveURL(/font-weight-controls/, {timeout: 15_000});

			await page
				.locator('[data-timeline-marquee-item][title="Hundreds font weight"]')
				.click();
			const hundredsControl = page.getByRole('button', {
				name: '700',
				exact: true,
			});
			await expect(hundredsControl).toBeVisible();
			await hundredsControl.click();
			await page.locator('input[value="700"]').press('ArrowUp');
			await page.keyboard.press('Enter');
			await expect
				.poll(() => fs.readFileSync(compositionFile, 'utf-8'))
				.toContain('fontWeight: 800');

			await page
				.locator('[data-timeline-marquee-item][title="Numeric font weight"]')
				.click();
			const numericControl = page.getByRole('button', {
				name: '650',
				exact: true,
			});
			await expect(numericControl).toBeVisible();
			await numericControl.click();
			await page.locator('input[value="650"]').fill('450');
			await page.keyboard.press('Enter');
			await expect
				.poll(() => fs.readFileSync(compositionFile, 'utf-8'))
				.toContain('fontWeight: 450');

			await page
				.locator('[data-timeline-marquee-item][title="String font weight"]')
				.click();
			const stringControl = page.locator('input[value="650"]');
			await expect(stringControl).toBeVisible();
			await stringControl.fill('675');
			await page.keyboard.press('Enter');
			await expect
				.poll(() => fs.readFileSync(compositionFile, 'utf-8'))
				.toContain("fontWeight: '675'");

			await page
				.locator('[data-timeline-marquee-item][title="Keyword font weight"]')
				.click();
			const keywordControl = page.getByTitle('style.fontWeight');
			await expect(keywordControl).toContainText('bold');
			await keywordControl.click();
			await page.getByText('normal', {exact: true}).last().click();
			await expect
				.poll(() => fs.readFileSync(compositionFile, 'utf-8'))
				.toContain("fontWeight: 'normal'");
		} finally {
			fs.writeFileSync(compositionFile, originalSource);
		}
	});
});
