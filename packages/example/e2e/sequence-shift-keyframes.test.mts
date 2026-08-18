import fs from 'fs';
import path from 'path';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

const sequenceShiftFile = path.join(
	exampleDir,
	'src',
	'VisualModeTests',
	'SequenceShiftRepro.tsx',
);

test.describe('moving sequence keyframes', () => {
	let sourceBefore: string;

	test.beforeEach(async () => {
		sourceBefore = fs.readFileSync(sequenceShiftFile, 'utf-8');
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
		fs.writeFileSync(sequenceShiftFile, sourceBefore);
	});

	test('moves nested outer-clock descendant keyframes without double-shifting local-clock descendants', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/sequence-shift-repro`);
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);
		const outerDescendant = page.locator(
			'[data-timeline-marquee-item][title="Outer frame descendant"]',
		);
		await expect(outerDescendant).toBeVisible({timeout: 15_000});
		await page.keyboard.press('g');
		const currentFrameInput = page.locator('input:focus');
		await expect(currentFrameInput).toBeVisible();
		await currentFrameInput.fill('12');
		await currentFrameInput.press('Enter');
		await expect(
			page.locator(
				'[data-timeline-marquee-item][title="Nested outer frame descendant"]',
			),
		).toBeVisible({timeout: 15_000});
		const getTranslateX = (backgroundColor: string) =>
			page.evaluate((color) => {
				const element = [...document.querySelectorAll('div')].find(
					(candidate) => getComputedStyle(candidate).backgroundColor === color,
				);
				if (element === undefined) {
					throw new Error(`Could not find the element with color ${color}`);
				}

				return Number.parseFloat(getComputedStyle(element).translate);
			}, backgroundColor);
		const getOuterTranslateX = () => getTranslateX('rgb(30, 144, 255)');
		const getNestedOuterTranslateX = () => getTranslateX('rgb(255, 105, 180)');
		await expect.poll(getOuterTranslateX).toBeCloseTo(100, 3);
		await expect.poll(getNestedOuterTranslateX).toBeCloseTo(120, 3);

		const parent = page.locator(
			'[data-timeline-marquee-item][title="<AbsoluteFill>"]',
		);
		await expect(parent).toBeVisible({timeout: 15_000});
		const box = await parent.boundingBox();
		if (box === null) {
			throw new Error('Expected the parent sequence to have a bounding box');
		}

		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.mouse.down();
		try {
			await page.mouse.move(
				box.x + box.width / 2 + box.width / 60,
				box.y + box.height / 2,
				{steps: 5},
			);
			await expect.poll(getOuterTranslateX).toBeCloseTo(50, 3);
			await expect.poll(getNestedOuterTranslateX).toBeCloseTo(90, 3);
		} finally {
			await page.mouse.up();
		}
		await expect
			.poll(() => fs.readFileSync(sequenceShiftFile, 'utf-8'))
			.toContain('from={1}');
		await expect.poll(getOuterTranslateX).toBeCloseTo(50, 3);
		await expect.poll(getNestedOuterTranslateX).toBeCloseTo(90, 3);
		const source = fs.readFileSync(sequenceShiftFile, 'utf-8');
		expect(source).toContain(
			"translate: interpolate(frame, [11, 21], ['0px 0px', '500px 0px']",
		);
		expect(source).toContain('opacity: interpolate(frame, [10, 20], [0, 1])');
		expect(source).toContain(
			"translate: interpolate(frame, [9, 19], ['0px 0px', '300px 0px']",
		);
		expect(source).toContain('opacity: interpolate(frame, [4, 14], [0, 1])');
	});
});
