import fs from 'fs';
import path from 'path';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test('trimming captions clipped by a parent moves their visible start and persists across reload', async ({
	page,
}) => {
	test.setTimeout(120_000);
	const fixture = path.join(exampleDir, 'src', 'CaptionLeftEdgeTrimRepro.tsx');
	const original = fs.readFileSync(fixture, 'utf-8');
	try {
		await startStudio();
		await page.goto(`${STUDIO_URL}/caption-left-edge-trim-repro`);
		const trim = page.getByRole('separator', {
			name: 'Drag to trim start',
			exact: true,
		});
		const row = page
			.getByRole('group', {
				name: 'Presenter introduction (2) captions',
				exact: true,
			})
			.filter({has: trim});
		await expect(row).toBeVisible({timeout: 30_000});
		await page.keyboard.press('g');
		await page.locator('input:focus').fill('90');
		await page.locator('input:focus').press('Enter');
		await expect(async () => {
			await row.click();
			await expect(page.getByRole('textbox', {name: 'Caption 1'})).toBeVisible({
				timeout: 1_000,
			});
		}).toPass({timeout: 30_000});

		const left = row.getByRole('separator', {
			name: 'Drag to trim start',
			exact: true,
		});
		const right = row.getByRole('separator', {
			name: 'Drag to change duration',
			exact: true,
		});
		const bar = await row.boundingBox();
		const initialLeft = await left.boundingBox();
		const initialRight = await right.boundingBox();
		if (!bar || !initialLeft || !initialRight) {
			throw new Error('Expected caption bar and trim handles');
		}
		const pixelsPerFrame = bar.width / 129;
		let trimmedFrames = 0;
		for (const delta of [30, 10]) {
			const handle = await left.boundingBox();
			if (!handle) throw new Error('Expected caption left edge');
			const x = handle.x + handle.width / 2;
			const y = handle.y + handle.height / 2;
			await page.mouse.move(x, y);
			await page.mouse.down();
			await page.mouse.move(x + pixelsPerFrame * delta, y, {steps: 5});
			await page.mouse.up();
			trimmedFrames += delta;
			await expect
				.poll(() => fs.readFileSync(fixture, 'utf-8'))
				.toMatch(
					new RegExp(
						`from=\\{${369 + trimmedFrames}\\}[\\s\\S]*durationInFrames=\\{${129 - trimmedFrames}\\}[\\s\\S]*trimBefore=\\{${369 + trimmedFrames}\\}`,
					),
				);
			await expect
				.poll(async () => (await left.boundingBox())?.x)
				.toBeCloseTo(initialLeft.x + pixelsPerFrame * trimmedFrames, 0);
			await expect
				.poll(async () => (await right.boundingBox())?.x)
				.toBeCloseTo(initialRight.x, 0);
		}

		await page.reload();
		await expect(row).toBeVisible({timeout: 30_000});
		for (const frame of [69, 70]) {
			await page.keyboard.press('g');
			await page.locator('input:focus').fill(String(frame));
			await page.locator('input:focus').press('Enter');
			const caption = page.getByText(
				'Drag the left edge of this caption track',
				{
					exact: true,
				},
			);
			if (frame === 69) {
				await expect(caption).toBeHidden();
			} else {
				await expect(caption).toBeVisible();
			}
		}
	} finally {
		await stopStudio();
		fs.writeFileSync(fixture, original);
	}
});
