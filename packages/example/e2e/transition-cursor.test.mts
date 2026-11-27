import fs from 'node:fs';
import {expect, test} from '@playwright/test';
import {STUDIO_URL, rootFile} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({
	viewport: {width: 1920, height: 1200},
});

test('TransitionSeries clips trim independently and the transition marker keeps its default cursor', async ({
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
		await expect(transition).toHaveCSS('cursor', 'default');
		const bounds = await transition.boundingBox();
		if (bounds === null) {
			throw new Error('Expected the transition marker');
		}

		const x = bounds.x + bounds.width / 2;
		const y = bounds.y + bounds.height / 2;
		await page.mouse.move(x, y);
		await page.mouse.down();
		await page.mouse.move(x + (bounds.width / 30) * 10, y, {steps: 5});
		await page.mouse.up();

		const incoming = page.getByRole('group', {
			name: 'Incoming scene',
			exact: true,
		});
		await incoming.hover();
		const trimStart = incoming.getByRole('separator', {
			name: 'Drag to trim start',
		});
		await expect(trimStart).toBeVisible();
		await expect(
			page.getByRole('separator', {name: 'Drag to roll edit'}),
		).toHaveCount(0);

		const trimX = bounds.x + bounds.width + 2;
		await page.mouse.move(trimX, y);
		await page.mouse.down();
		await page.mouse.move(trimX + (bounds.width / 30) * 10, y, {steps: 5});
		await page.mouse.up();
		await expect
			.poll(() => fs.readFileSync(rootFile, 'utf8'))
			.toMatch(
				/name="Incoming scene"\s+durationInFrames=\{80\}\s+trimBefore=\{10\}/,
			);
		expect(fs.readFileSync(rootFile, 'utf8')).toMatch(
			/name="Outgoing scene"\s+durationInFrames=\{90\}/,
		);
	} finally {
		await page.mouse.up();
		await stopStudio();
	}
});
