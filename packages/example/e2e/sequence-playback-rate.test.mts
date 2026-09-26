import fs from 'fs';
import path from 'path';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

test('retimed nested sequences preserve local frames when trimming, moving, and editing keyframes', async ({
	page,
}) => {
	test.setTimeout(120_000);
	const fixture = path.join(exampleDir, 'src', 'SequencePlaybackRateE2e.tsx');
	const original = fs.readFileSync(fixture, 'utf-8');
	await startStudio();
	try {
		await page.goto(`${STUDIO_URL}/sequence-playback-rate`);
		const row = page.locator(
			'[data-timeline-marquee-item][aria-label="Retimed child"]',
		);
		await expect(
			page
				.getByRole('group', {name: 'Double speed parent', exact: true})
				.first(),
		).toBeVisible({timeout: 30_000});
		await page.keyboard.press('g');
		const frameInput = page.locator('input:focus');
		await frameInput.fill('30');
		await frameInput.press('Enter');
		await expect(row).toBeVisible({timeout: 30_000});
		await expect(
			page.getByText('Local frame: 14', {exact: true}),
		).toBeVisible();

		const rotation = page
			.getByRole('group', {name: 'Rotation', exact: true})
			.first();
		await expect(async () => {
			await row.click();
			await expect(rotation).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 30_000});
		await rotation.click();
		const rotationRow = rotation.locator(
			'xpath=ancestor::div[.//button[@aria-label="Add keyframe"]][1]',
		);
		await rotationRow.getByRole('button', {name: 'Add keyframe'}).click();
		await expect
			.poll(() => fs.readFileSync(fixture, 'utf-8'))
			.toMatch(/interpolate\(\s*frame,\s*\[20,\s*40,\s*80\]/);

		// The parent ends at frame 65, so the child is visible for 45 frames.
		await row.click();
		const trim = page
			.getByRole('separator', {name: 'Drag to trim start', exact: true})
			.filter({visible: true});
		const duration = page
			.getByRole('separator', {name: 'Drag to change duration', exact: true})
			.filter({visible: true});
		const trimBox = await trim.last().boundingBox();
		const durationBox = await duration.last().boundingBox();
		if (!trimBox || !durationBox)
			throw new Error('Expected sequence edge handles');
		const pixelsPerFrame = (durationBox.x - trimBox.x) / 45;
		const trimX = trimBox.x + trimBox.width / 2;
		const trimY = trimBox.y + trimBox.height / 2;
		await page.mouse.move(trimX, trimY);
		await page.mouse.down();
		await page.mouse.move(trimX + pixelsPerFrame * 5, trimY, {steps: 5});
		await page.mouse.up();
		await expect
			.poll(() => fs.readFileSync(fixture, 'utf-8'))
			.toMatch(
				/from=\{30\}[\s\S]*durationInFrames=\{95\}[\s\S]*trimBefore=\{9\}/,
			);
		await expect(
			page.getByText('Local frame: 14', {exact: true}),
		).toBeVisible();

		const moveBox = await row.boundingBox();
		if (!moveBox) throw new Error('Expected sequence row');
		await page.mouse.move(
			moveBox.x + moveBox.width / 2,
			moveBox.y + moveBox.height / 2,
		);
		await page.mouse.down();
		await page.mouse.move(
			moveBox.x + moveBox.width / 2 + pixelsPerFrame * 5,
			moveBox.y + moveBox.height / 2,
			{steps: 5},
		);
		await page.mouse.up();
		await expect
			.poll(() => fs.readFileSync(fixture, 'utf-8'))
			.toMatch(/from=\{40\}/);
		await expect(page.getByText('Local frame: 9', {exact: true})).toBeVisible();
		await expect
			.poll(() => fs.readFileSync(fixture, 'utf-8'))
			.toMatch(/interpolate\(\s*frame,\s*\[30,\s*50,\s*90\]/);

		const endBox = await duration.last().boundingBox();
		if (!endBox) throw new Error('Expected duration handle');
		const endX = endBox.x + endBox.width / 2;
		const endY = endBox.y + endBox.height / 2;
		await page.mouse.move(endX, endY);
		await page.mouse.down();
		await page.mouse.move(endX - pixelsPerFrame * 5, endY, {steps: 5});
		await page.mouse.up();
		await expect
			.poll(() => fs.readFileSync(fixture, 'utf-8'))
			.toMatch(/durationInFrames=\{30\}/);
	} finally {
		await stopStudio();
		fs.writeFileSync(fixture, original);
	}
});
