import fs from 'fs';
import path from 'path';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

const affineFrameClockFile = path.join(
	exampleDir,
	'src',
	'VisualModeTests',
	'AffineFrameClock.tsx',
);

const readRotationKeyframes = () => {
	const source = fs.readFileSync(affineFrameClockFile, 'utf-8');
	const match = /rotate:\s*interpolate\(\s*captureFrame,\s*\[([^\]]*)\]/.exec(
		source,
	);
	if (match === null) {
		throw new Error('Could not read affine frame clock keyframes');
	}

	return match[1]
		.split(',')
		.map((frame) => Number(frame.trim()))
		.filter((frame) => !Number.isNaN(frame));
};

const readTranslateKeyframes = () => {
	const source = fs.readFileSync(affineFrameClockFile, 'utf-8');
	const match =
		/translate:\s*interpolate\(\s*frame,\s*\[([^\]]*)\],\s*\[([^\]]*)\]/.exec(
			source,
		);
	if (match === null) {
		throw new Error('Could not read affine frame clock translate keyframes');
	}

	return {
		frames: match[1]
			.split(',')
			.map((frame) => Number(frame.trim()))
			.filter((frame) => !Number.isNaN(frame)),
		values: [...match[2].matchAll(/(['"])(.*?)\1/g)].map((value) => value[2]),
	};
};

test.describe('affine frame clock keyframes', () => {
	let sourceBefore: string;

	test.beforeEach(async () => {
		sourceBefore = fs.readFileSync(affineFrameClockFile, 'utf-8');
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
		fs.writeFileSync(affineFrameClockFile, sourceBefore);
	});

	test('edits a keyframe through a useCurrentFrame alias', async ({page}) => {
		await page.goto(`${STUDIO_URL}/affine-frame-clock`);
		await expect(page).toHaveURL(/affine-frame-clock/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const affineFrameClock = page.locator(
			'[data-timeline-marquee-item][title="Affine frame clock"]',
		);
		const rotation = page.getByTitle('Rotation', {exact: true}).first();
		await expect(async () => {
			await affineFrameClock.click();
			await expect(rotation).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 30_000});
		await rotation.click();
		const firstKeyframe = page
			.getByTitle('Keyframe at frame 0', {exact: true})
			.last();
		await expect(firstKeyframe).toBeVisible({timeout: 15_000});
		await firstKeyframe.click();

		const rotationSurface = page.locator(
			'[data-remotion-studio-canvas-rotation]',
		);
		await expect(rotationSurface).toBeVisible({timeout: 15_000});

		await page.keyboard.press('g');
		const currentFrameInput = page.locator('input:focus');
		await expect(currentFrameInput).toBeVisible();
		await currentFrameInput.fill('10');
		await currentFrameInput.press('Enter');

		const point = await rotationSurface.evaluate((surface) => {
			const box = surface.getBoundingClientRect();
			for (let yIndex = 1; yIndex < 10; yIndex++) {
				for (let xIndex = 1; xIndex < 10; xIndex++) {
					const candidate = {
						x: box.x + (box.width * xIndex) / 10,
						y: box.y + (box.height * yIndex) / 10,
					};
					if (
						document
							.elementFromPoint(candidate.x, candidate.y)
							?.closest('[data-remotion-studio-canvas-rotation]') === surface
					) {
						return candidate;
					}
				}
			}

			throw new Error('Rotation surface should have an interactive point');
		});
		await page.mouse.move(point.x, point.y);
		await page.mouse.down();
		await page.mouse.move(point.x + 40, point.y + 30, {steps: 5});
		await page.mouse.up();

		await expect.poll(readRotationKeyframes).toEqual([30, 40, 60]);

		await page.keyboard.press('g');
		await expect(currentFrameInput).toBeVisible();
		await currentFrameInput.fill('50');
		await currentFrameInput.press('Enter');

		const offset = page.getByTitle('Offset', {exact: true}).first();
		await offset.click();
		const offsetRow = offset.locator(
			'xpath=ancestor::div[.//button[@aria-label="Add keyframe"]][1]',
		);
		await offsetRow.getByRole('button', {name: 'Add keyframe'}).click();

		await expect.poll(readTranslateKeyframes).toEqual({
			frames: [0, 30, 50],
			values: ['0px 0px', '100px 0px', '100px 0px'],
		});
	});
});
