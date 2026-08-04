import fs from 'fs';
import {expect, test, type Page} from '@playwright/test';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {STUDIO_URL, effectKeyframeE2eFile} from './constants.mts';
import {navigateToSchemaTest} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

const dropAssetOnCanvas = async ({
	assetPath,
	durationInSeconds,
	page,
}: {
	assetPath: string;
	durationInSeconds: number;
	page: Page;
}) => {
	const dragData = StudioProtocolInternals.makeDragData({
		type: 'asset',
		assetPath,
		durationInSeconds,
		height: null,
		width: null,
	});
	await page
		.locator('.remotion-studio-composition-container')
		.evaluate((element, data) => {
			const rect = element.getBoundingClientRect();
			const dataTransfer = new DataTransfer();
			dataTransfer.setData(data.mimeType, data.payload);
			element.dispatchEvent(
				new DragEvent('drop', {
					bubbles: true,
					cancelable: true,
					clientX: rect.left + rect.width / 2,
					clientY: rect.top + rect.height / 2,
					dataTransfer,
				}),
			);
		}, dragData);
};

const getVideoTag = (source: string, assetPath: string) => {
	const sourceIndex = source.indexOf(assetPath);
	if (sourceIndex === -1) {
		throw new Error(`Could not find ${assetPath} in source`);
	}

	const tagStart = source.lastIndexOf('<Video', sourceIndex);
	const tagEnd = source.indexOf('/>', sourceIndex);
	if (tagStart === -1 || tagEnd === -1) {
		throw new Error(`Could not find <Video> tag for ${assetPath}`);
	}

	return source.slice(tagStart, tagEnd + 2);
};

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

	test('should open submenus toward the side with more space', async ({
		page,
	}) => {
		await page.setViewportSize({width: 500, height: 904});
		await page.goto(STUDIO_URL);
		await expect(page).toHaveTitle(/Remotion/i, {timeout: 15_000});

		await page.locator('.__remotion-studio-menu-initiator').first().click();
		const compositionItem = page
			.locator('.__remotion-studio-menu-item')
			.filter({hasText: 'Composition'});
		await compositionItem.hover();

		const subMenuItem = page.getByRole('button', {name: 'Copy file location'});
		await expect(subMenuItem).toBeVisible();

		const [compositionBox, subMenuItemBox] = await Promise.all([
			compositionItem.boundingBox(),
			subMenuItem.boundingBox(),
		]);

		expect(compositionBox).not.toBeNull();
		expect(subMenuItemBox).not.toBeNull();
		expect(subMenuItemBox!.x).toBeGreaterThan(compositionBox!.x);
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

	test('should place Canvas drops where they are visible at the playhead', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		await expect(
			page.getByRole('button', {name: '0', exact: true}),
		).toBeVisible({timeout: 15_000});

		await page.locator('[data-timeline-scrubber]').click();
		await expect(
			page.getByRole('button', {name: '45', exact: true}),
		).toBeVisible();

		await dropAssetOnCanvas({
			assetPath: 'quick.mov',
			durationInSeconds: 5.866667,
			page,
		});
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf-8'))
			.toContain('quick.mov');
		const longVideoTag = getVideoTag(
			fs.readFileSync(effectKeyframeE2eFile, 'utf-8'),
			'quick.mov',
		);
		expect(longVideoTag).not.toContain('from=');

		await dropAssetOnCanvas({
			assetPath: 'drums-drumsticks.mp4',
			durationInSeconds: 0.85,
			page,
		});
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf-8'))
			.toContain('drums-drumsticks.mp4');
		const shortVideoTag = getVideoTag(
			fs.readFileSync(effectKeyframeE2eFile, 'utf-8'),
			'drums-drumsticks.mp4',
		);
		expect(shortVideoTag).toContain('from={45}');
	});
});
