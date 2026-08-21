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
		await page.addInitScript(() => {
			Object.defineProperty(window, 'remotion_editorName', {
				configurable: true,
				get: () => 'Test editor',
				set: () => undefined,
			});
		});
		await page.route('**/api/default-editor-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultEditor: 'vscode',
						installedEditors: [
							{
								id: 'vscode',
								name: 'Test editor',
								nameWithType: 'Test editor',
							},
						],
					},
				},
			});
		});
		const openInEditorRequests: unknown[] = [];
		await page.route('**/api/open-in-editor', async (route) => {
			openInEditorRequests.push(route.request().postDataJSON());
			await route.fulfill({
				json: {success: true, data: {success: true}},
			});
		});

		await page.goto(`${STUDIO_URL}/sequence-shift-repro`);
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);
		await page.keyboard.press('g');
		const currentFrameInput = page.locator('input:focus');
		await expect(currentFrameInput).toBeVisible();
		await currentFrameInput.fill('22');
		await currentFrameInput.press('Enter');
		await expect(
			page.locator(
				'[data-timeline-marquee-item][title="Outer frame descendant"]',
			),
		).toBeVisible({timeout: 15_000});
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
		await expect.poll(getOuterTranslateX).toBeCloseTo(250, 3);
		await expect.poll(getNestedOuterTranslateX).toBeCloseTo(210, 3);

		const parent = page.locator(
			'[data-timeline-marquee-item][title="<AbsoluteFill>"]',
		);
		await expect(parent).toBeVisible({timeout: 15_000});
		const box = await parent.boundingBox();
		if (box === null) {
			throw new Error('Expected the parent sequence to have a bounding box');
		}

		await page.waitForTimeout(1_000);
		await parent.dblclick();
		await expect.poll(() => openInEditorRequests.length).toBe(1);
		openInEditorRequests.length = 0;
		await page.waitForTimeout(500);
		await page.evaluate(() => {
			Reflect.set(window, 'remotionTimelineDoubleClicks', 0);
			document.addEventListener(
				'dblclick',
				() => {
					const doubleClicks = Reflect.get(
						window,
						'remotionTimelineDoubleClicks',
					);
					Reflect.set(window, 'remotionTimelineDoubleClicks', doubleClicks + 1);
				},
				{capture: true},
			);
		});

		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.mouse.down();
		await page.mouse.up();
		await page.mouse.down();
		try {
			await page.mouse.move(
				box.x + box.width / 2 + box.width / 55,
				box.y + box.height / 2,
				{steps: 5},
			);
			await expect.poll(getOuterTranslateX).toBeCloseTo(200, 3);
			await expect.poll(getNestedOuterTranslateX).toBeCloseTo(180, 3);
		} finally {
			await page.mouse.up();
		}
		await expect
			.poll(() => fs.readFileSync(sequenceShiftFile, 'utf-8'))
			.toContain('from={6}');
		await expect.poll(getOuterTranslateX).toBeCloseTo(200, 3);
		await expect.poll(getNestedOuterTranslateX).toBeCloseTo(180, 3);
		const source = fs.readFileSync(sequenceShiftFile, 'utf-8');
		expect(source).toContain(
			"translate: interpolate(frame, [18, 28], ['0px 0px', '500px 0px']",
		);
		expect(source).toContain('opacity: interpolate(frame, [11, 21], [0, 1])');
		expect(source).toMatch(
			/translate: interpolate\(\s*frame,\s*\[16, 26\],\s*\['0px 0px', '300px 0px'\]/,
		);
		expect(source).toContain('opacity: interpolate(frame, [4, 14], [0, 1])');
		await page.waitForTimeout(100);
		const doubleClicks = await page.evaluate(() =>
			Reflect.get(window, 'remotionTimelineDoubleClicks'),
		);
		if (doubleClicks === 0) {
			await parent.dispatchEvent('dblclick');
		}

		expect(openInEditorRequests).toEqual([]);
	});
});
