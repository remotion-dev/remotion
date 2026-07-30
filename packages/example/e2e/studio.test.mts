import {expect, test} from '@playwright/test';
import {STUDIO_URL} from './constants.mts';
import {navigateToSchemaTest} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.describe('visual mode', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('should load the studio', async ({page}) => {
		await page.goto(STUDIO_URL);
		await expect(page).toHaveTitle(/Remotion/i, {timeout: 15_000});
	});

	test('should show the composition list', async ({page}) => {
		await page.goto(STUDIO_URL);
		await expect(page.getByRole('button', {name: 'Schema'})).toBeVisible({
			timeout: 15_000,
		});
	});

	test('should layer modals above floating sidebars', async ({page}) => {
		await page.setViewportSize({width: 1000, height: 700});
		await page.goto(STUDIO_URL);

		const toggleLeftSidebar = page.locator('[data-sidebar-toggle="left"]');
		const compositionsTab = page.getByText('Compositions', {exact: true});
		const waitForZIndexEffects = () =>
			page.evaluate(
				() =>
					new Promise<void>((resolve) => {
						requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
					}),
			);

		await expect(toggleLeftSidebar).toBeVisible({timeout: 15_000});
		await toggleLeftSidebar.click();
		await expect(compositionsTab).toBeVisible();

		await page.mouse.click(500, 250);
		await expect(compositionsTab).toBeVisible();

		await page.setViewportSize({width: 800, height: 700});
		await expect(compositionsTab).toBeVisible();
		await waitForZIndexEffects();

		await page.getByRole('button', {name: /Search/}).click();
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		expect(
			await page.evaluate(
				() =>
					document.elementFromPoint(100, 100)?.closest('[role="dialog"]') !==
					null,
			),
		).toBe(true);
		await waitForZIndexEffects();

		await page.mouse.click(790, 690);
		await expect(dialog).toBeHidden();
		await expect(compositionsTab).toBeVisible();
		await waitForZIndexEffects();

		await page.mouse.click(500, 250);
		await expect(compositionsTab).toBeHidden();
	});

	test('should navigate to schema-test composition', async ({page}) => {
		await navigateToSchemaTest(page);
	});

	test('should not subscribe to package-owned sequence props', async ({
		page,
	}) => {
		const subscriptionSources: string[] = [];
		page.on('request', (request) => {
			if (!request.url().includes('/api/subscribe-to-sequence-props')) {
				return;
			}

			const body = request.postDataJSON() as {fileName: string};
			subscriptionSources.push(body.fileName);
		});

		await page.goto(`${STUDIO_URL}/package-absolute-fill`);
		await expect
			.poll(
				() =>
					subscriptionSources.filter((source) =>
						source.startsWith('./src/LightLeak/'),
					).length,
				{timeout: 15_000},
			)
			.toBeGreaterThan(0);

		await page.waitForTimeout(500);
		expect(subscriptionSources.some((source) => source.startsWith('../'))).toBe(
			false,
		);
	});

	test('should seek in read-only Studio', async ({page}) => {
		await page.addInitScript(() => {
			Object.defineProperty(window, 'remotion_isReadOnlyStudio', {
				configurable: false,
				get: () => true,
				set: () => undefined,
			});
		});

		await page.goto(`${STUDIO_URL}/schema-test`);
		await expect(
			page.getByRole('button', {name: '0', exact: true}),
		).toBeVisible({timeout: 15_000});

		await page.locator('[data-timeline-scrubber]').click();

		await expect(
			page.getByRole('button', {name: '75', exact: true}),
		).toBeVisible();
	});
});
