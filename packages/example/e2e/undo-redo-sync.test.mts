import fs from 'fs';
import {expect, test} from '@playwright/test';
import {
	EXPANDED_SIDEBAR_STATE,
	STUDIO_URL,
	newVideoFile,
} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('undo redo sync across tabs', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('a new studio tab should receive the current undo/redo state', async ({
		browser,
	}) => {
		const originalContent = fs.readFileSync(newVideoFile, 'utf-8');
		expect(originalContent).not.toContain('playbackRate');

		// 1. Open the first tab and make a change to create undo state
		const context1 = await browser.newContext({
			storageState: EXPANDED_SIDEBAR_STATE,
		});
		const page1 = await context1.newPage();
		await page1.goto(`${STUDIO_URL}/NewVideo`);
		await expect(page1).toHaveURL(/NewVideo/, {timeout: 15_000});

		// Dismiss any error overlay
		await page1.waitForTimeout(2_000);
		await page1.evaluate(() => {
			const overlay = document.getElementById('remotion-error-overlay');
			if (overlay) {
				overlay.style.display = 'none';
			}
		});

		// 2. Click the expand arrow on the Video track
		const expandTrackButton = page1.locator(
			'button[aria-label="Expand track properties"]:not([disabled])',
		);
		await expect(expandTrackButton).toBeVisible({timeout: 15_000});
		await expandTrackButton.click();

		// 3. Expand the Controls section to reveal the schema fields
		const expandControlsButton = page1.locator(
			'button[aria-label="Expand Controls section"]:not([disabled])',
		);
		await expect(expandControlsButton).toBeVisible({timeout: 10_000});
		await expandControlsButton.click();

		// 4. Click the Playback Rate input dragger
		const playbackRateLabel = page1.getByText('Playback Rate', {exact: true});
		await expect(playbackRateLabel).toBeVisible({timeout: 10_000});

		const dragger = playbackRateLabel
			.locator('xpath=ancestor::div[1]/..')
			.locator('button.__remotion_input_dragger');
		await dragger.click();

		// 4. Enter a new playback rate
		const input = page1.locator('input[type="number"]:focus');
		await expect(input).toBeVisible({timeout: 5_000});
		await input.fill('2');
		await input.press('Enter');

		// 5. Assert the file was updated
		await expect
			.poll(
				() => {
					const content = fs.readFileSync(newVideoFile, 'utf-8');
					return content.includes('playbackRate={2}');
				},
				{
					message:
						'Expected NewVideo.tsx to contain "playbackRate" after prop edit',
					timeout: 10_000,
				},
			)
			.toBe(true);

		// 6. Assert that undo button is visible in the first tab
		const undoButton1 = page1.locator('button[title*="Undo"]');
		await expect(undoButton1).toBeVisible({timeout: 5_000});

		// 7. Open a second tab and verify it also shows undo button
		const context2 = await browser.newContext({
			storageState: EXPANDED_SIDEBAR_STATE,
		});
		const page2 = await context2.newPage();
		await page2.goto(`${STUDIO_URL}/NewVideo`);
		await expect(page2).toHaveURL(/NewVideo/, {timeout: 15_000});

		const undoButton2 = page2.locator('button[title*="Undo"]');
		await expect(undoButton2).toBeVisible({timeout: 10_000});

		// 8. Clean up: reset file to initial state
		await page1.waitForTimeout(2_000);
		fs.writeFileSync(newVideoFile, originalContent);

		// 9. Assert undo buttons disappear in both tabs
		await expect(undoButton1).not.toBeVisible({timeout: 15_000});
		await expect(undoButton2).not.toBeVisible({timeout: 15_000});

		await context1.close();
		await context2.close();
	});
});
