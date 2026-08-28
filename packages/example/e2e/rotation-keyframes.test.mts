import fs from 'fs';
import path from 'path';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

const rotationKeyframeFile = path.join(
	exampleDir,
	'src',
	'RotationKeyframeE2e.tsx',
);

const readRotationKeyframes = () => {
	const source = fs.readFileSync(rotationKeyframeFile, 'utf-8');
	const match =
		/rotate:\s*interpolate\(\s*frame,\s*\[([^\]]*)\],\s*\[([^\]]*)\]/.exec(
			source,
		);
	if (match === null) {
		throw new Error('Could not read rotation keyframes');
	}

	return {
		frames: match[1]
			.split(',')
			.map((frame) => Number(frame.trim()))
			.filter((frame) => !Number.isNaN(frame)),
		values: [...match[2].matchAll(/(['"])(.*?)\1/g)].map((value) => value[2]),
	};
};

const readTranslate = () => {
	const source = fs.readFileSync(rotationKeyframeFile, 'utf-8');
	return /translate:\s*(['"])(.*?)\1/.exec(source)?.[2] ?? null;
};

test.describe('canvas rotation keyframes', () => {
	let sourceBefore: string;

	test.beforeEach(async () => {
		sourceBefore = fs.readFileSync(rotationKeyframeFile, 'utf-8');
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
		fs.writeFileSync(rotationKeyframeFile, sourceBefore);
	});

	test('edits rotation keyframes and temporarily translates', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/rotation-keyframe-e2e`);
		await expect(page).toHaveURL(/rotation-keyframe-e2e/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const keyframedRotation = page
			.getByTitle('Keyframed rotation', {exact: true})
			.first();
		const rotation = page.getByTitle('Rotation', {exact: true}).first();
		await expect(async () => {
			await keyframedRotation.click();
			await expect(rotation).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 30_000});
		await rotation.click();
		const rotationSurface = page.locator(
			'[data-remotion-studio-canvas-rotation]',
		);
		await expect(rotationSurface).toBeVisible({timeout: 15_000});
		await page.getByTitle('Keyframe at frame 0', {exact: true}).first().click();

		await page.keyboard.press('g');
		const currentFrameInput = page.locator('input:focus');
		await expect(currentFrameInput).toBeVisible();
		await currentFrameInput.fill('10');
		await currentFrameInput.press('Enter');

		const getRotationSurfacePoint = () => {
			return rotationSurface.evaluate((surface) => {
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
		};
		const dragRotationSurface = async (deltaX: number, deltaY: number) => {
			const point = await getRotationSurfacePoint();
			await page.mouse.move(point.x, point.y);
			await page.mouse.down();
			await page.mouse.move(point.x + deltaX, point.y + deltaY, {steps: 5});
			await page.mouse.up();
		};

		await dragRotationSurface(40, 30);
		await expect
			.poll(() => readRotationKeyframes().frames)
			.toEqual([0, 10, 30]);
		const firstValueAtFrame10 = readRotationKeyframes().values[1];
		expect(firstValueAtFrame10).toBeDefined();

		await dragRotationSurface(-30, 45);
		await expect
			.poll(() => readRotationKeyframes().values[1])
			.not.toBe(firstValueAtFrame10);
		expect(readRotationKeyframes().frames).toEqual([0, 10, 30]);

		const rotationBeforeTranslation = readRotationKeyframes();
		const translateBefore = readTranslate();
		expect(translateBefore).toBeNull();
		const point = await getRotationSurfacePoint();
		const snapDelta = await rotationSurface.evaluate((surface) => {
			const surfaceBox = surface.getBoundingClientRect();
			const canvasBox = surface.ownerSVGElement?.getBoundingClientRect();
			if (canvasBox === undefined) {
				throw new Error('Rotation surface should be inside the canvas overlay');
			}

			return {
				x:
					canvasBox.x +
					canvasBox.width / 2 -
					(surfaceBox.x + surfaceBox.width / 2) +
					2,
				y:
					canvasBox.y +
					canvasBox.height / 2 -
					(surfaceBox.y + surfaceBox.height / 2) +
					2,
			};
		});
		const commandKey = await page.evaluate(() =>
			navigator.platform.startsWith('Mac') ? 'Meta' : 'Control',
		);
		await page.mouse.move(point.x, point.y);
		const rotationCursor = await rotationSurface.getAttribute('cursor');
		expect(rotationCursor).not.toBe('default');
		await page.keyboard.down(commandKey);
		await expect(rotationSurface).toHaveAttribute('cursor', 'default');
		await page.keyboard.up(commandKey);
		await expect(rotationSurface).toHaveAttribute('cursor', rotationCursor!);

		await page.keyboard.down(commandKey);
		await expect(rotationSurface).toHaveAttribute('pointer-events', 'none');
		await page.mouse.down();
		await page.mouse.move(point.x + snapDelta.x, point.y + snapDelta.y, {
			steps: 5,
		});
		await expect
			.poll(() =>
				rotationSurface.evaluate((surface) => {
					const surfaceBox = surface.getBoundingClientRect();
					const canvasBox = surface.ownerSVGElement?.getBoundingClientRect();
					if (canvasBox === undefined) {
						throw new Error(
							'Rotation surface should be inside the canvas overlay',
						);
					}

					return Math.max(
						Math.abs(
							canvasBox.x +
								canvasBox.width / 2 -
								(surfaceBox.x + surfaceBox.width / 2),
						),
						Math.abs(
							canvasBox.y +
								canvasBox.height / 2 -
								(surfaceBox.y + surfaceBox.height / 2),
						),
					);
				}),
			)
			.toBeLessThan(0.5);
		await page.mouse.up();
		await page.keyboard.up(commandKey);

		await expect.poll(readTranslate).not.toBeNull();
		expect(readTranslate()).not.toBe(translateBefore);
		expect(readRotationKeyframes()).toEqual(rotationBeforeTranslation);
	});
});
