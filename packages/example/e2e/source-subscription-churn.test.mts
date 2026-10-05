import fs from 'node:fs';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({
	storageState: EXPANDED_SIDEBAR_STATE,
	viewport: {width: 1920, height: 1200},
});

test('trimming a parent then its expression child saves with the latest instance context', async ({
	page,
}) => {
	test.setTimeout(120_000);
	const fixture = path.join(exampleDir, 'src', 'SourceSubscriptionChurn.tsx');
	const original = fs.readFileSync(fixture, 'utf8');

	const trimRightEdge = async (
		label: string,
		duration: number,
		delta: number,
	) => {
		const row = page.locator(
			`[data-timeline-marquee-item][aria-label="${label}"]`,
		);
		await row.click();
		const end = row
			.getByRole('separator', {name: 'Drag to change duration', exact: true})
			.filter({visible: true})
			.first();
		const start = row
			.getByRole('separator', {name: 'Drag to trim start', exact: true})
			.filter({visible: true})
			.first();
		let endBox = await end.boundingBox();
		let startBox = await start.boundingBox();
		await expect
			.poll(async () => {
				await end.scrollIntoViewIfNeeded();
				endBox = await end.boundingBox();
				startBox = await start.boundingBox();
				return endBox !== null && startBox !== null;
			})
			.toBe(true);
		if (!endBox || !startBox) throw new Error('Expected trim handles');
		const pixelsPerFrame = (endBox.x - startBox.x) / duration;
		const x = endBox.x + endBox.width / 2;
		const y = endBox.y + endBox.height / 2;
		await page.mouse.move(x, y);
		await page.mouse.down();
		await page.mouse.move(x + pixelsPerFrame * delta, y, {steps: 5});
		const saved = page.waitForResponse((response) =>
			response.url().endsWith('/api/save-sequence-props'),
		);
		await page.mouse.up();
		expect(await (await saved).json()).toMatchObject({
			success: true,
			data: {canUpdate: true},
		});
	};

	try {
		// The example is also editable in the main Studio. Give this test a known
		// starting point and restore any manual edits afterwards.
		fs.writeFileSync(
			fixture,
			original.replace(
				/(<Sequence name="Trim this parent" durationInFrames=\{)\d+(\})/,
				(_, prefix: string, suffix: string) => `${prefix}300${suffix}`,
			),
		);
		await startStudio();
		await page.goto(`${STUDIO_URL}/SourceSubscriptionChurn`);
		await expect(
			page.getByText('Parent scope: 300 frames', {exact: true}),
		).toBeVisible({timeout: 30_000});
		await page.keyboard.press('g');
		await page.locator('input:focus').fill('30');
		await page.locator('input:focus').press('Enter');

		await trimRightEdge('Trim this parent', 300, 60);
		await expect
			.poll(() => fs.readFileSync(fixture, 'utf8'))
			.toMatch(/name="Trim this parent"\s+durationInFrames=\{360\}/);
		await expect(
			page.getByText('Expression A: 180 frames', {exact: true}),
		).toBeVisible();
		await expect(
			page.getByText('Expression B: 200 frames', {exact: true}),
		).toBeVisible();

		await trimRightEdge('Expression A', 180, 36);
		await expect
			.poll(() => fs.readFileSync(fixture, 'utf8'))
			.toMatch(/durationInFrames=\{duration \* 0\.6\}/);
		await expect(
			page.getByText('Expression A: 216 frames', {exact: true}),
		).toBeVisible();
		await expect(
			page.getByText('Expression B: 240 frames', {exact: true}),
		).toBeVisible();
		await page
			.getByRole('group', {name: 'Opacity', exact: true})
			.first()
			.click();
		await expect(
			page
				.getByRole('button', {
					name: 'Select keyframe at frame 359',
					exact: true,
				})
				.last(),
		).toBeVisible();

		// Keep one real file-watcher update; expression combinations and
		// subscription counts are covered by the React integration test.
		fs.writeFileSync(
			fixture,
			fs
				.readFileSync(fixture, 'utf8')
				.replace('duration * 0.6', 'duration * 0.75'),
		);
		await expect(
			page.getByText('Expression A: 270 frames', {exact: true}),
		).toBeVisible();
		await expect(
			page.getByText('Expression B: 300 frames', {exact: true}),
		).toBeVisible();
	} finally {
		await stopStudio();
		fs.writeFileSync(fixture, original);
	}
});
