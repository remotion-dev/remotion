import fs from 'fs';
import path from 'path';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

const doubleClickDragFile = path.join(
	exampleDir,
	'src',
	'VisualModeTests',
	'DoubleClickDragRepro.tsx',
);

test.describe('double-clicking a timeline sequence', () => {
	let sourceBefore: string;

	test.beforeEach(async () => {
		sourceBefore = fs.readFileSync(doubleClickDragFile, 'utf-8');
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
		fs.writeFileSync(doubleClickDragFile, sourceBefore);
	});

	test('a double-click whose second press drags the sequence moves it without opening the connected composition', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/double-click-drag-repro`);
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const sequence = page.locator(
			'[data-timeline-marquee-item][title="Double click drag target"]',
		);
		await expect(sequence).toBeVisible({timeout: 15_000});
		const box = await sequence.boundingBox();
		if (box === null) {
			throw new Error('Expected the sequence to have a bounding box');
		}

		// The sequence is 30 frames wide, so box.width / 30 is one frame.
		const fourFrames = (box.width / 30) * 4;
		const centerX = box.x + box.width / 2;
		const centerY = box.y + box.height / 2;

		// A double-click where the second press turns into a drag: the browser
		// still fires `dblclick` on the second release.
		await page.mouse.move(centerX, centerY);
		await page.mouse.down();
		await page.mouse.up();
		await page.mouse.down({clickCount: 2});
		await page.mouse.move(centerX + fourFrames, centerY, {steps: 5});
		await page.mouse.up({clickCount: 2});

		// The drag committed...
		await expect
			.poll(() => fs.readFileSync(doubleClickDragFile, 'utf-8'), {
				timeout: 15_000,
			})
			.toContain('from={6}');
		// ...but the gesture did not open the connected composition.
		await expect(page).toHaveURL(/double-click-drag-repro/);

		// A plain double-click still opens the connected composition.
		await expect(sequence).toBeVisible({timeout: 15_000});
		await sequence.dblclick();
		await expect(page).toHaveURL(/double-click-drag-child/, {
			timeout: 15_000,
		});
	});
});
