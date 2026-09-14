import fs from 'fs';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, rootFile, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test.describe('Input dragger', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('handles keyboard focus and commits a drag when pointer capture is lost on release', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);

		const widthButton = page.getByRole('button', {name: 'Width'});
		await expect(widthButton).toBeVisible({timeout: 15_000});
		await widthButton.click();

		const widthInput = page.getByRole('textbox', {name: 'Width'});
		await expect(widthInput).toBeFocused();
		await widthInput.press('Tab');

		const heightInput = page.getByRole('textbox', {name: 'Height'});
		await expect(heightInput).toBeFocused();
		await heightInput.press('Escape');
		await expect(widthButton).toBeVisible();

		const originalSource = fs.readFileSync(rootFile, 'utf-8');
		const box = await widthButton.boundingBox();
		if (!box) {
			throw new Error('Width input dragger is not visible');
		}

		const capturedWidthButton = await widthButton.elementHandle();
		if (!capturedWidthButton) {
			throw new Error('Could not retain the width input dragger');
		}

		await capturedWidthButton.evaluate((element) => {
			element.addEventListener(
				'pointerdown',
				(event) => {
					(element as HTMLElement).dataset.pointerId = String(event.pointerId);
				},
				{once: true},
			);
		});
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.mouse.down();
		await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2);
		await expect(widthButton).not.toHaveText('1280');
		const draggedWidth = (await widthButton.textContent())?.trim();
		if (!draggedWidth) {
			throw new Error('Expected the width to change while dragging');
		}

		const lostCaptureEvent = await capturedWidthButton.evaluate((element) => {
			const pointerId = Number((element as HTMLElement).dataset.pointerId);
			const event = new PointerEvent('lostpointercapture', {
				bubbles: true,
				buttons: 0,
				pointerId,
			});
			element.dispatchEvent(event);
			return {
				buttons: event.buttons,
				isConnected: element.isConnected,
				pointerId: event.pointerId,
			};
		});
		expect(lostCaptureEvent.buttons).toBe(0);
		expect(lostCaptureEvent.isConnected).toBe(true);
		expect(lostCaptureEvent.pointerId).toBeGreaterThan(0);
		await page.mouse.up();

		await expect
			.poll(() => fs.readFileSync(rootFile, 'utf-8'))
			.toBe(originalSource.replace('width={1280}', `width={${draggedWidth}}`));
	});
});
