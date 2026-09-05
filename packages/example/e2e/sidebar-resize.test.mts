import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({
	storageState: EXPANDED_SIDEBAR_STATE,
	viewport: {width: 1440, height: 900},
});

test.beforeEach(async () => {
	await startStudio();
});

test.afterEach(async () => {
	await stopStudio();
});

test('sidebars can reopen during a resize and keep their last state when dragging ends', async ({
	page,
}) => {
	await page.goto(`${STUDIO_URL}/AnimatedBarChart`);

	for (const side of ['left', 'right'] as const) {
		const content =
			side === 'left'
				? page.getByText('Compositions', {exact: true})
				: page.getByRole('button', {name: 'Width', exact: true});
		await expect(content).toBeVisible({timeout: 15_000});
		const icon = page.locator(`[data-sidebar-toggle="${side}"] > div`);
		await expect(icon).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
		const handles = page.locator('.remotion-splitter-vertical');
		const handle = side === 'left' ? handles.first() : handles.nth(1);
		const box = (await handle.boundingBox())!;
		const x = box.x + box.width / 2;
		const y = box.y + box.height / 2;
		const edge = side === 'left' ? 0 : 1439;

		await page.mouse.move(x, y);
		await page.mouse.down();
		for (let attempt = 0; attempt < 2; attempt++) {
			const initialFrame = await page
				.getByText('Regional growth', {exact: true})
				.evaluate((element) => {
					const {x: frameX, width} = element.getBoundingClientRect();
					return {x: frameX, width};
				});
			const [frames] = await Promise.all([
				page.getByText('Regional growth', {exact: true}).evaluate(
					(element) =>
						new Promise<{x: number; width: number}[]>((resolve) => {
							const samples: {x: number; width: number}[] = [];
							const sample = () => {
								const {x: frameX, width} = element.getBoundingClientRect();
								samples.push({x: frameX, width});
								if (samples.length === 12) {
									resolve(samples);
								} else {
									requestAnimationFrame(sample);
								}
							};
							requestAnimationFrame(sample);
						}),
				),
				page.mouse.move(edge, y),
			]);
			await expect(content).toBeHidden();
			await expect(icon).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
			// A collapse may paint the old or new geometry, but no intermediate stage.
			const finalFrame = frames[frames.length - 1];
			for (const frame of frames) {
				expect([initialFrame, finalFrame]).toContainEqual(frame);
			}
			await page.mouse.move(x, y);
			await expect(content).toBeVisible();
			await expect(icon).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
		}

		await page.mouse.up();
		await page.reload();
		await expect(content).toBeVisible();

		for (const interruption of ['blur', 'lostpointercapture'] as const) {
			const restoredBox = (await handle.boundingBox())!;
			await page.mouse.move(
				restoredBox.x + restoredBox.width / 2,
				restoredBox.y + restoredBox.height / 2,
			);
			await page.mouse.down();
			await page.mouse.move(edge, y);
			await expect(content).toBeHidden();
			await expect(icon).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
			if (interruption === 'blur') {
				await page.evaluate(() => window.dispatchEvent(new Event('blur')));
			} else {
				await handle.evaluate((element) => element.releasePointerCapture(1));
			}

			await page.mouse.move(x, y);
			await page.mouse.up();
			await expect(content).toBeHidden();
			await expect(icon).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
			await page.reload();
			await expect(content).toBeHidden();
			await expect(icon).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
			await page.locator(`[data-sidebar-toggle="${side}"]`).click();
			await expect(content).toBeVisible();
			await expect(icon).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
			await expect
				.poll(async () => (await handle.boundingBox())?.x)
				.toBeCloseTo(restoredBox.x, 1);
		}

		const finalBox = (await handle.boundingBox())!;
		await page.mouse.move(
			finalBox.x + finalBox.width / 2,
			finalBox.y + finalBox.height / 2,
		);
		await page.mouse.down();
		await page.mouse.move(edge, y);
		await expect(content).toBeHidden();
		// Let the canvas finish reacting to the temporary collapse.
		await page.evaluate(
			() =>
				new Promise<void>((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
				),
		);
		const chartTitle = page.getByText('Regional growth', {exact: true});
		const collapsedTitleBox = await chartTitle.boundingBox();
		expect(collapsedTitleBox).not.toBeNull();
		await page.mouse.up();
		await expect
			.poll(() => chartTitle.boundingBox())
			.toEqual(collapsedTitleBox);
		await page.reload();
		await expect(content).toBeHidden();
		await page.locator(`[data-sidebar-toggle="${side}"]`).click();
		await expect(content).toBeVisible();
		await expect
			.poll(async () => (await handle.boundingBox())?.x)
			.toBeCloseTo(finalBox.x, 1);
	}
});
