import fs from 'node:fs';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import type {SubscribeToSequencePropsBatchRequest} from '@remotion/studio-shared';
import {EXPANDED_SIDEBAR_STATE, STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({
	storageState: EXPANDED_SIDEBAR_STATE,
	viewport: {width: 1920, height: 1200},
});

test('parent trim keeps source subscriptions stable and evaluates each mounted instance', async ({
	page,
}) => {
	test.setTimeout(120_000);
	const fixture = path.join(exampleDir, 'src', 'SourceSubscriptionChurn.tsx');
	const original = fs.readFileSync(fixture, 'utf8');
	const subscriptions: string[] = [];
	const errors: string[] = [];
	page.on('request', (request) => {
		if (/\/api\/(un)?subscribe-to-sequence-props$/.test(request.url()))
			subscriptions.push(request.postData() ?? '');
	});
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	await startStudio();
	try {
		await page.goto(`${STUDIO_URL}/SourceSubscriptionChurn`);
		const parent = page.locator(
			'[data-timeline-marquee-item][aria-label="Trim this parent"]',
		);
		await expect(parent).toBeVisible({timeout: 30_000});
		await page.keyboard.press('g');
		await page.locator('input:focus').fill('30');
		await page.locator('input:focus').press('Enter');
		await expect(
			page.getByText('Parent scope: 300 frames', {exact: true}),
		).toBeVisible();
		await expect(
			page.getByText('Expression A: 150 frames', {exact: true}),
		).toBeVisible();
		await expect(
			page.getByText('Expression B: 200 frames', {exact: true}),
		).toBeVisible();
		const expression = page.locator(
			'[data-timeline-marquee-item][aria-label="Expression A"]',
		);
		await expression.click();
		const opacity = page
			.getByRole('group', {name: 'Opacity', exact: true})
			.first();
		await expect(opacity).toBeVisible();
		await opacity.click();
		await expect(
			page
				.getByRole('button', {
					name: 'Select keyframe at frame 299',
					exact: true,
				})
				.last(),
		).toBeVisible();
		await parent.click();
		const end = parent
			.getByRole('separator', {name: 'Drag to change duration', exact: true})
			.filter({visible: true})
			.first();
		const start = parent
			.getByRole('separator', {name: 'Drag to trim start', exact: true})
			.filter({visible: true})
			.first();
		await expect(end).toBeVisible();
		const endBox = await end.boundingBox();
		const startBox = await start.boundingBox();
		if (!endBox || !startBox) throw new Error('Expected parent trim handles');
		const pixelsPerFrame = (endBox.x - startBox.x) / 300;
		const x = endBox.x + endBox.width / 2;
		const y = endBox.y + endBox.height / 2;
		// The initial batched source subscriptions must finish before measuring preview traffic.
		await page.waitForTimeout(500);
		const subscribedLines = subscriptions
			.flatMap(
				(body) =>
					(JSON.parse(body) as SubscribeToSequencePropsBatchRequest).requests,
			)
			.filter((request) =>
				request.fileName.endsWith('SourceSubscriptionChurn.tsx'),
			)
			.map((request) => request.line);
		const literalChildLines = [
			...original.matchAll(/<Sequence name="(?:Nested child|Root control) /g),
		].map((match) => original.slice(0, match.index).split('\n').length);
		expect(literalChildLines).toHaveLength(10);
		expect(subscribedLines).toEqual(expect.arrayContaining(literalChildLines));
		const initialSubscriptions = subscriptions.length;
		await page.mouse.move(x, y);
		await page.mouse.down();
		for (const delta of [20, 40, 60]) {
			await page.mouse.move(x + pixelsPerFrame * delta, y, {steps: 3});
			await expect(
				page.getByText(`Parent scope: ${300 + delta} frames`, {exact: true}),
			).toBeVisible();
			for (let i = 1; i <= 8; i++) {
				await expect(
					page.getByText(`Child ${String(i).padStart(2, '0')}: 180 frames`, {
						exact: true,
					}),
				).toBeVisible();
			}
			for (const label of ['Root control 01', 'Root control 02']) {
				await expect(
					page.getByText(`${label}: 180 frames`, {exact: true}),
				).toBeVisible();
			}
			await expect(
				page.getByText(`Expression A: ${(300 + delta) / 2} frames`, {
					exact: true,
				}),
			).toBeVisible();
			await expect(
				page.getByText('Expression B: 200 frames', {exact: true}),
			).toBeVisible();
			await expect
				.poll(() =>
					page
						.getByTestId('Expression A')
						.evaluate((element) =>
							Number(getComputedStyle(element.parentElement!).opacity),
						),
				)
				.toBeCloseTo(30 / (299 + delta), 5);
			await expect
				.poll(() =>
					page
						.getByTestId('Expression B')
						.evaluate((element) =>
							Number(getComputedStyle(element.parentElement!).opacity),
						),
				)
				.toBeCloseTo(30 / 399, 5);
			await expect(
				page
					.getByRole('button', {
						name: `Select keyframe at frame ${299 + delta}`,
						exact: true,
					})
					.last(),
			).toBeVisible();
			expect(subscriptions).toHaveLength(initialSubscriptions);
		}
		await page.mouse.up();
		await expect
			.poll(() => fs.readFileSync(fixture, 'utf8'))
			.toMatch(/name="Trim this parent"\s+durationInFrames=\{360\}/);

		// Edit the shared JSX using the first instance's latest (360 frame) context.
		await expression.click();
		const expressionEnd = await expression
			.getByRole('separator', {name: 'Drag to change duration', exact: true})
			.boundingBox();
		if (!expressionEnd) throw new Error('Expected expression trim handle');
		await page.mouse.move(
			expressionEnd.x + expressionEnd.width / 2,
			expressionEnd.y + expressionEnd.height / 2,
		);
		await page.mouse.down();
		await page.mouse.move(
			expressionEnd.x + expressionEnd.width / 2 + pixelsPerFrame * 36,
			expressionEnd.y + expressionEnd.height / 2,
			{steps: 5},
		);
		await page.mouse.up();
		await expect
			.poll(() => fs.readFileSync(fixture, 'utf8'))
			.toMatch(/durationInFrames=\{duration \* 0\.6\}/);
		await expect(
			page.getByText('Expression A: 216 frames', {exact: true}),
		).toBeVisible();
		await expect(
			page.getByText('Expression B: 240 frames', {exact: true}),
		).toBeVisible();

		const keyframe = page
			.getByRole('button', {name: 'Select keyframe at frame 359', exact: true})
			.last();
		await keyframe.scrollIntoViewIfNeeded();
		const keyframeBox = await keyframe.boundingBox();
		if (!keyframeBox) throw new Error('Expected duration-dependent keyframe');
		await page.mouse.move(
			keyframeBox.x + keyframeBox.width / 2,
			keyframeBox.y + keyframeBox.height / 2,
		);
		await page.mouse.down();
		await page.mouse.move(
			keyframeBox.x + keyframeBox.width / 2 - pixelsPerFrame * 10,
			keyframeBox.y + keyframeBox.height / 2,
			{steps: 5},
		);
		await page.mouse.up();
		await expect
			.poll(() => fs.readFileSync(fixture, 'utf8'))
			.toContain('duration - 11');
		await expect
			.poll(() =>
				page
					.getByTestId('Expression B')
					.evaluate((element) =>
						Number(getComputedStyle(element.parentElement!).opacity),
					),
			)
			.toBeCloseTo(30 / 389, 5);

		const sourceBefore = fs.readFileSync(fixture, 'utf8');
		fs.writeFileSync(
			fixture,
			sourceBefore
				.replace('duration * 0.6', 'duration * 0.75')
				.replace('duration - 11', 'duration - 2'),
		);
		await expect(
			page.getByText('Expression A: 270 frames', {exact: true}),
		).toBeVisible();
		await expect(
			page.getByText('Expression B: 300 frames', {exact: true}),
		).toBeVisible();
		await expect
			.poll(() =>
				page
					.getByTestId('Expression A')
					.evaluate((element) =>
						Number(getComputedStyle(element.parentElement!).opacity),
					),
			)
			.toBeCloseTo(30 / 358, 5);
		expect(
			errors.filter((error) => /maximum update depth/i.test(error)),
		).toEqual([]);
	} finally {
		await stopStudio();
		fs.writeFileSync(fixture, original);
	}
});
