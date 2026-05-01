import fs from 'fs';
import {expect, test} from '@playwright/test';
import {
	EXPANDED_SIDEBAR_STATE,
	STUDIO_URL,
	newVideoFile,
} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('undo redo', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('should undo and redo a playback rate change', async ({page}) => {
		const originalContent = fs.readFileSync(newVideoFile, 'utf-8');
		expect(originalContent).not.toContain('playbackRate');

		// 1. Navigate to the NewVideo composition
		await page.goto(`${STUDIO_URL}/NewVideo`);
		await expect(page).toHaveURL(/NewVideo/, {timeout: 15_000});

		// Dismiss any error overlay that may appear (video can't play in test)
		await page.waitForTimeout(2_000);
		await page.evaluate(() => {
			const overlay = document.getElementById('remotion-error-overlay');
			if (overlay) {
				overlay.style.display = 'none';
			}
		});

		// 2. Click the expand arrow on the Video track
		const expandTrackButton = page.locator(
			'button[aria-label="Expand track properties"]:not([disabled])',
		);
		await expect(expandTrackButton).toBeVisible({timeout: 15_000});
		await expandTrackButton.click();

		// 3. Expand the Controls section to reveal the schema fields
		const expandControlsButton = page.locator(
			'button[aria-label="Expand Controls section"]:not([disabled])',
		);
		await expect(expandControlsButton).toBeVisible({timeout: 10_000});
		await expandControlsButton.click();

		// 4. Click the Playback Rate input dragger
		const playbackRateLabel = page.getByText('Playback Rate', {exact: true});
		await expect(playbackRateLabel).toBeVisible({timeout: 10_000});

		const dragger = playbackRateLabel
			.locator('xpath=ancestor::div[1]/..')
			.locator('button.__remotion_input_dragger');
		await dragger.click();

		// 4. Enter a new playback rate
		const input = page.locator('input[type="number"]:focus');
		await expect(input).toBeVisible({timeout: 5_000});
		await input.fill('2');
		await input.press('Enter');

		// 5. Assert that NewVideo.tsx was updated with playbackRate
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

		// 6. Assert that the undo button has appeared
		const undoButton = page.locator('button[title*="Undo"]');
		await expect(undoButton).toBeVisible({timeout: 5_000});

		// 7. Click the undo button
		await undoButton.click();

		// 8. Assert that the file has reverted (no more playbackRate)
		await expect
			.poll(
				() => {
					const content = fs.readFileSync(newVideoFile, 'utf-8');
					return content.includes('playbackRate');
				},
				{
					message:
						'Expected NewVideo.tsx to NOT contain "playbackRate" after undo',
					timeout: 10_000,
				},
			)
			.toBe(false);

		// 9. Assert that the redo button has shown up
		const redoButton = page.locator('button[title*="Redo"]');
		await expect(redoButton).toBeVisible({timeout: 5_000});

		// 10. Click the redo button
		await redoButton.click();

		// 11. Assert that the file has changed again (playbackRate is back)
		await expect
			.poll(
				() => {
					const content = fs.readFileSync(newVideoFile, 'utf-8');
					return content.includes('playbackRate');
				},
				{
					message: 'Expected NewVideo.tsx to contain "playbackRate" after redo',
					timeout: 10_000,
				},
			)
			.toBe(true);

		// 12. Reset file to initial state (remove playbackRate prop)
		// Wait for the redo's file watcher event to be consumed before writing,
		// otherwise macOS fsevents may batch both writes into a single event
		await page.waitForTimeout(2_000);
		fs.writeFileSync(newVideoFile, originalContent);

		// 13. Assert that Undo + Redo have disappeared (external write clears the undo stack)
		await expect(undoButton).not.toBeVisible({timeout: 15_000});
		await expect(redoButton).not.toBeVisible({timeout: 15_000});
	});
});
