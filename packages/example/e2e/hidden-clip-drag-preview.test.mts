import fs from 'node:fs';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({
	storageState: EXPANDED_SIDEBAR_STATE,
	viewport: {width: 1920, height: 1200},
});

test('hidden video clips update throughout a left trim, including trimmed nested scenes', async ({
	page,
}) => {
	test.setTimeout(120_000);
	const fixture = path.join(exampleDir, 'src', 'HiddenClipDragPreview.tsx');
	const original = fs.readFileSync(fixture, 'utf8');

	try {
		await startStudio();
		await page.goto(`${STUDIO_URL}/hidden-clip-drag-preview`);
		await expect(
			page
				.getByRole('group', {name: 'Nested hidden clip', exact: true})
				.filter({has: page.getByRole('separator')}),
		).toBeVisible({timeout: 30_000});
		await page.keyboard.press('g');
		await page.locator('input:focus').fill('90');
		await page.locator('input:focus').press('Enter');
		await expect(
			page.getByRole('button', {name: '90', exact: true}),
		).toBeVisible();
		await page.keyboard.press('g');
		await page.locator('input:focus').fill('150');
		await page.locator('input:focus').press('Enter');

		// One clip is in a future scene. The other has just become hidden and
		// inherits a source trim from its Series.Sequence parent.
		for (const {name, sourceStart} of [
			{name: 'Hidden clip', sourceStart: 0},
			{name: 'Nested hidden clip', sourceStart: 30},
		]) {
			const start = page.getByRole('separator', {
				name: 'Drag to trim start',
				exact: true,
			});
			const clip = page
				.getByRole('group', {name, exact: true})
				.filter({has: start});
			await expect(clip).toBeVisible({timeout: 30_000});
			const initial = await clip.boundingBox();
			const handle = await clip
				.getByRole('separator', {name: 'Drag to trim start', exact: true})
				.boundingBox();
			if (initial === null || handle === null) {
				throw new Error('Expected the hidden clip and its left trim handle');
			}

			const sourceBeforeDrag = fs.readFileSync(fixture, 'utf8');
			const pixelsPerFrame = initial.width / 90;
			const x = handle.x + handle.width / 2;
			const y = handle.y + handle.height / 2;
			await page.mouse.move(x, y);
			await page.mouse.down();
			for (const delta of [10, 20]) {
				await page.mouse.move(x + pixelsPerFrame * delta, y, {steps: 5});
				await expect
					.poll(async () => {
						const current = await clip.boundingBox();
						return current === null
							? null
							: {
									startDelta: Math.round(
										(current.x - initial.x) / pixelsPerFrame,
									),
									duration: Math.round(current.width / pixelsPerFrame),
								};
					})
					.toEqual({startDelta: delta, duration: 90 - delta});
			}

			// The preview must work before the source edit or its hot reload.
			expect(fs.readFileSync(fixture, 'utf8')).toBe(sourceBeforeDrag);
			await page.mouse.up();
			const expectedStart = sourceStart + 20;
			await expect
				.poll(() => fs.readFileSync(fixture, 'utf8'))
				.toMatch(
					new RegExp(
						String.raw`name="${name}"[^]*?from=\{${expectedStart}\}\s+durationInFrames=\{70\}\s+trimBefore=\{${expectedStart}\}`,
					),
				);
		}
	} finally {
		await page.mouse.up();
		await stopStudio();
		fs.writeFileSync(fixture, original);
	}
});
