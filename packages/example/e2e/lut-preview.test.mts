import fs from 'node:fs';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import sharp from 'sharp';
import {exampleDir, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test('finds LUT assets and previews their colors, updates, and errors', async ({
	page,
}) => {
	const directory = fs.mkdtempSync(
		path.join(exampleDir, 'public', 'lut-preview-'),
	);
	const directoryName = path.basename(directory);
	const file = path.join(directory, 'invert.CUBE');
	fs.writeFileSync(
		file,
		`TITLE "Invert"
LUT_3D_SIZE 2
1 1 1
0 1 1
1 0 1
0 0 1
1 1 0
0 1 0
1 0 0
0 0 0`,
	);
	fs.writeFileSync(path.join(directory, 'not-a-lut.txt'), 'Not a LUT');

	try {
		await startStudio();
		await page.route('https://remotion.media/transition-bg-blue.jpg', (route) =>
			route.fulfill({
				contentType: 'image/svg+xml',
				headers: {'access-control-allow-origin': '*'},
				body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="427"><rect width="640" height="427" fill="rgb(32,128,224)"/></svg>',
			}),
		);
		await page.goto(STUDIO_URL);
		await page.keyboard.press('ControlOrMeta+k');
		const search = page.getByPlaceholder('Search compositions...');
		await search.fill(`$ type:lut ${directoryName}`);
		await page.keyboard.press('Enter');
		await expect(page).toHaveURL(
			new RegExp(`/assets/${directoryName}/invert.CUBE$`),
		);
		const before = page.getByRole('img', {name: 'Sample image before LUT'});
		const after = page.getByRole('img', {name: 'Sample image after LUT'});
		await expect(before).toBeVisible();
		await expect(after).toBeVisible();
		const readPixel = (canvas: SVGElement | HTMLElement) => {
			if (!(canvas instanceof HTMLCanvasElement)) {
				throw new Error('Expected the LUT preview canvas');
			}

			const context = canvas.getContext('2d');
			if (!context) {
				throw new Error('Expected a 2D canvas context');
			}

			return [...context.getImageData(100, 100, 1, 1).data];
		};
		expect(await before.evaluate(readPixel)).toEqual([32, 128, 224, 255]);
		expect(await after.evaluate(readPixel)).toEqual([223, 127, 31, 255]);
		const slider = page.getByRole('slider', {
			name: 'Before and after comparison',
		});
		await expect(before).toHaveCSS('user-select', 'none');
		await expect(after).toHaveCSS('user-select', 'none');
		await expect(page.getByText('Before', {exact: true})).toHaveCount(0);
		await expect(page.getByText('After', {exact: true})).toHaveCount(0);
		const readComparison = async () => {
			const {data, info} = await sharp(await slider.screenshot())
				.removeAlpha()
				.raw()
				.toBuffer({resolveWithObject: true});
			return [0.25, 0.75].map((fraction) => {
				const offset =
					(Math.floor(info.height * 0.75) * info.width +
						Math.floor(info.width * fraction)) *
					info.channels;
				return [...data.subarray(offset, offset + 3)];
			});
		};
		expect(await readComparison()).toEqual([
			[32, 128, 224],
			[223, 127, 31],
		]);
		await expect(page.getByText('2 x 2 x 2 LUT', {exact: false})).toHaveCount(
			0,
		);
		await slider.click();
		await expect(slider).toBeFocused();
		expect(
			await slider.evaluate((element) => getComputedStyle(element).boxShadow),
		).toBe('none');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Shift+Tab');
		await expect(slider).toBeFocused();
		expect(
			await slider.evaluate((element) => getComputedStyle(element).boxShadow),
		).not.toBe('none');
		await slider.press('Home');
		expect(await readComparison()).toEqual([
			[223, 127, 31],
			[223, 127, 31],
		]);
		await slider.press('End');
		expect(await readComparison()).toEqual([
			[32, 128, 224],
			[32, 128, 224],
		]);
		const bounds = await slider.boundingBox();
		if (!bounds) {
			throw new Error('Expected the comparison slider bounds');
		}

		await page.mouse.move(
			bounds.x + bounds.width * 0.9,
			bounds.y + bounds.height * 0.5,
		);
		await page.mouse.down();
		await page.mouse.move(
			bounds.x + bounds.width * 0.5,
			bounds.y + bounds.height * 0.5,
			{steps: 5},
		);
		await page.mouse.up();
		expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(
			'',
		);
		expect(await readComparison()).toEqual([
			[32, 128, 224],
			[223, 127, 31],
		]);
		fs.writeFileSync(file, 'LUT_3D_SIZE 2\n0 0 0');
		await expect(page.getByRole('alert')).toContainText(
			'Expected 8 LUT colors, got 1',
		);
		await expect(after).toBeHidden();

		fs.writeFileSync(file, 'TITLE "Identity"\nLUT_1D_SIZE 2\n0 0 0\n1 1 1');
		await expect(slider).toBeVisible();
		expect(await after.evaluate(readPixel)).toEqual([32, 128, 224, 255]);
		await page.setViewportSize({width: 720, height: 800});
		await expect(before).toBeVisible();
		await expect(after).toBeVisible();
		await expect
			.poll(async () => {
				const resized = await slider.boundingBox();
				return (
					resized !== null &&
					resized.width > 0 &&
					resized.height > 0 &&
					resized.x >= 0 &&
					resized.y >= 0 &&
					resized.x + resized.width <= 720 &&
					resized.y + resized.height <= 800
				);
			})
			.toBe(true);
	} finally {
		await stopStudio();
		fs.rmSync(directory, {recursive: true});
	}
});
