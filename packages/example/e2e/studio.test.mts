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

	test('should navigate to schema-test composition', async ({page}) => {
		await navigateToSchemaTest(page);
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
