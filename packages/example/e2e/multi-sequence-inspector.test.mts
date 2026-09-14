import fs from 'fs';
import {expect, test} from '@playwright/test';
import {
	EXPANDED_SIDEBAR_STATE,
	STUDIO_URL,
	visualMode3DFile,
} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test('edits shared controls and preserves relative translations in a single undoable save', async ({
	page,
}) => {
	try {
		await startStudio();
		await page.goto(`${STUDIO_URL}/visual-mode-3d`);
		const first = page.locator(
			'[data-timeline-marquee-item][title="2D transform"]',
		);
		const second = page.locator(
			'[data-timeline-marquee-item][title="3D transform"]',
		);
		await expect(async () => {
			await first.click();
			await second.click({modifiers: ['ControlOrMeta']});
			await expect(
				page.getByRole('button', {name: 'Offset X', exact: true}),
			).toHaveText('Mixed', {timeout: 1000});
		}).toPass({timeout: 30_000});
		await expect(
			page.getByText('2 sequences selected', {exact: true}),
		).toBeVisible();
		await page.screenshot({
			path: test.info().outputPath('mixed-inspector.png'),
		});
		const sourceBefore = fs.readFileSync(visualMode3DFile, 'utf-8');
		const x = page.getByRole('button', {name: 'Offset X', exact: true});
		await x.click();
		const input = page.getByRole('textbox', {name: 'Offset X', exact: true});
		await input.fill('99');
		await input.press('Escape');
		await expect(x).toHaveText('Mixed');
		await x.click();
		await input.fill('120');
		await input.press('Enter');
		await expect
			.poll(() => fs.readFileSync(visualMode3DFile, 'utf-8'))
			.toContain('120px 0px');
		await expect
			.poll(() => fs.readFileSync(visualMode3DFile, 'utf-8'))
			.toContain('120px 500px');
		await expect(x).toHaveText('120px');
		await expect(
			page.getByRole('button', {name: 'Offset Y', exact: true}),
		).toHaveText('Mixed');

		await page.keyboard.press('ControlOrMeta+z');
		await expect
			.poll(() => fs.readFileSync(visualMode3DFile, 'utf-8'))
			.toBe(sourceBefore);
		await expect(x).toHaveText('Mixed');
		const box = await x.boundingBox();
		if (!box) {
			throw new Error('Translation control is not visible');
		}
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.mouse.down();
		await page.mouse.move(box.x + box.width / 2 + 24, box.y + box.height / 2, {
			steps: 4,
		});
		await page.mouse.up();
		await expect
			.poll(() => {
				const source = fs.readFileSync(visualMode3DFile, 'utf-8');
				return [
					...source.matchAll(/translate:\s*['"](-?[\d.]+)px (-?[\d.]+)px['"]/g),
				].map((match) => [Number(match[1]), Number(match[2])]);
			})
			.toEqual([
				[60, 0],
				[560, 500],
				[450, 450],
			]);
		await expect(
			page.getByText('2 sequences selected', {exact: true}),
		).toBeVisible();
		await page.keyboard.press('ControlOrMeta+z');
		await expect
			.poll(() => fs.readFileSync(visualMode3DFile, 'utf-8'))
			.toBe(sourceBefore);
		// AbsoluteFill and Sequence share transform fields, but only Sequence has layout.
		await expect(
			page.getByText('Layout', {exact: true}).first(),
		).toBeAttached();
		await page
			.locator('[data-timeline-marquee-item][title="<AbsoluteFill>"]')
			.first()
			.click();
		await first.click({modifiers: ['ControlOrMeta']});
		await expect(
			page.getByText('2 sequences selected', {exact: true}),
		).toBeVisible();
		await expect(page.getByText('Layout', {exact: true})).toHaveCount(0);
		await page.getByRole('button', {name: 'Opacity', exact: true}).click();
		const opacity = page.getByRole('textbox', {name: 'Opacity', exact: true});
		await opacity.fill('0.5');
		await opacity.press('Enter');
		await expect
			.poll(
				() =>
					(
						fs
							.readFileSync(visualMode3DFile, 'utf-8')
							.match(/opacity: 0\.5/g) ?? []
					).length,
			)
			.toBe(2);
		const opacityButton = page.getByRole('button', {
			name: 'Opacity',
			exact: true,
		});
		const opacityBox = await opacityButton.boundingBox();
		if (!opacityBox) {
			throw new Error('Opacity control is not visible');
		}
		await page.mouse.move(
			opacityBox.x + opacityBox.width / 2,
			opacityBox.y + opacityBox.height / 2,
		);
		await page.mouse.down();
		await page.mouse.move(
			opacityBox.x + opacityBox.width / 2 + 14,
			opacityBox.y + opacityBox.height / 2,
			{steps: 3},
		);
		await page.mouse.up();
		await expect
			.poll(
				() =>
					(
						fs
							.readFileSync(visualMode3DFile, 'utf-8')
							.match(/opacity: 0\.6[,\s}]/g) ?? []
					).length,
			)
			.toBe(2);
		await page.keyboard.press('ControlOrMeta+z');
		await expect(opacityButton).toHaveText('0.50');
		await page.keyboard.press('ControlOrMeta+z');
		await expect
			.poll(() => fs.readFileSync(visualMode3DFile, 'utf-8'))
			.toBe(sourceBefore);
	} finally {
		await stopStudio();
	}
});
