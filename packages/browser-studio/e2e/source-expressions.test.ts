import {expect, test} from '@playwright/test';
import type {BrowserStudioOperations} from '@remotion/studio-shared';

test.use({viewport: {width: 1920, height: 1200}});

test('evaluates shared source expressions while trimming without replacing Browser Studio subscriptions', async ({
	page,
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/?source=source-expressions');
	const studio = page.frameLocator('iframe');
	await studio.locator('[data-compname="SourceSubscriptionChurn"]').click();
	const parent = studio.locator(
		'[data-timeline-marquee-item][aria-label="Trim this parent"]',
	);
	await expect(parent).toBeVisible();
	await page.keyboard.press('g');
	await studio.locator('input:focus').fill('30');
	await studio.locator('input:focus').press('Enter');
	await expect(
		studio.getByText('Expression A: 150 frames', {exact: true}),
	).toBeVisible();
	await expect(
		studio.getByText('Expression B: 200 frames', {exact: true}),
	).toBeVisible();
	await parent.click();
	await page.waitForTimeout(500);
	// Observe the actual host protocol without replacing its implementation.
	await studio.locator('body').evaluate(() => {
		const win = window as typeof window & {
			remotion_browserStudio: BrowserStudioOperations;
			subscriptionOperations: number;
		};
		win.subscriptionOperations = 0;
		const subscribe = win.remotion_browserStudio.subscribeToSequenceProps;
		const unsubscribe = win.remotion_browserStudio.unsubscribeFromSequenceProps;
		win.remotion_browserStudio.subscribeToSequenceProps = (request) => {
			win.subscriptionOperations++;
			return subscribe(request);
		};

		win.remotion_browserStudio.unsubscribeFromSequenceProps = (request) => {
			win.subscriptionOperations++;
			return unsubscribe(request);
		};
	});
	const end = await parent
		.getByRole('separator', {name: 'Drag to change duration', exact: true})
		.boundingBox();
	const start = await parent
		.getByRole('separator', {name: 'Drag to trim start', exact: true})
		.boundingBox();
	if (!end || !start) throw new Error('Expected parent trim handles');
	const pixelsPerFrame = (end.x - start.x) / 300;
	const x = end.x + end.width / 2;
	const y = end.y + end.height / 2;
	await page.mouse.move(x, y);
	await page.mouse.down();
	for (const delta of [20, 40, 60]) {
		await page.mouse.move(x + pixelsPerFrame * delta, y, {steps: 3});
		await expect(
			studio.getByText(`Parent scope: ${300 + delta} frames`, {exact: true}),
		).toBeVisible();
		await expect(
			studio.getByText(`Expression A: ${(300 + delta) / 2} frames`, {
				exact: true,
			}),
		).toBeVisible();
		await expect(
			studio.getByText('Expression B: 200 frames', {exact: true}),
		).toBeVisible();
		await expect
			.poll(() =>
				studio
					.getByTestId('Expression A')
					.evaluate((element) =>
						Number(getComputedStyle(element.parentElement!).opacity),
					),
			)
			.toBeCloseTo(30 / (299 + delta), 5);
		expect(
			await studio
				.locator('body')
				.evaluate(
					() =>
						(window as typeof window & {subscriptionOperations: number})
							.subscriptionOperations,
				),
		).toBe(0);
	}

	await page.mouse.up();
	const source = () =>
		page.evaluate(
			() =>
				(
					window as typeof window & {
						__browserStudioProject: {files: Record<string, string>};
					}
				).__browserStudioProject.files['/project/src/Composition.tsx'],
		);
	await expect
		.poll(source)
		.toMatch(/name="Trim this parent"\s+durationInFrames=\{360\}/);
	const expression = studio.locator(
		'[data-timeline-marquee-item][aria-label="Expression A"]',
	);
	await expression.click();
	const edge = await expression
		.getByRole('separator', {name: 'Drag to change duration', exact: true})
		.boundingBox();
	if (!edge) throw new Error('Expected expression trim handle');
	await page.mouse.move(edge.x + edge.width / 2, edge.y + edge.height / 2);
	await page.mouse.down();
	await page.mouse.move(
		edge.x + edge.width / 2 + pixelsPerFrame * 36,
		edge.y + edge.height / 2,
		{steps: 5},
	);
	await page.mouse.up();
	await expect.poll(source).toMatch(/durationInFrames=\{duration \* 0\.6\}/);
	await expect(
		studio.getByText('Expression A: 216 frames', {exact: true}),
	).toBeVisible();
	await expect(
		studio.getByText('Expression B: 240 frames', {exact: true}),
	).toBeVisible();
	expect(errors.filter((error) => /maximum update depth/i.test(error))).toEqual(
		[],
	);
});
