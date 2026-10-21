import fs from 'node:fs';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, rootFile} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({
	storageState: EXPANDED_SIDEBAR_STATE,
	viewport: {width: 1920, height: 1200},
});

test('transition rolling edits keep the default cursor while hovering and dragging', async ({
	page,
}) => {
	try {
		await startStudio();
		await page.goto(`${STUDIO_URL}/transition-cursor`);
		const transition = page.getByRole('group', {
			name: '<TS.Transition>',
			exact: true,
		});
		await transition.hover();
		const roll = transition.getByRole('separator', {name: 'Drag to roll edit'});
		await expect(roll).toBeVisible({timeout: 30_000});
		await roll.hover();
		await expect(roll).toHaveCSS('cursor', 'default');

		const bounds = await roll.boundingBox();
		if (bounds === null) {
			throw new Error('Expected the transition rolling target');
		}

		const x = bounds.x + bounds.width / 2;
		const y = bounds.y + bounds.height / 2;
		await page.mouse.move(x, y);
		await page.mouse.down();
		await page.mouse.move(x + (bounds.width / 30) * 10, y, {steps: 5});
		await expect(roll).toHaveCSS('cursor', 'default');
		await page.mouse.up();
		await expect
			.poll(() => fs.readFileSync(rootFile, 'utf8'))
			.toMatch(/name="Outgoing scene"\s+durationInFrames=\{100\}/);
		await expect
			.poll(() => fs.readFileSync(rootFile, 'utf8'))
			.toMatch(/name="Incoming scene"\s+durationInFrames=\{80\}/);
	} finally {
		await page.mouse.up();
		await stopStudio();
	}
});
