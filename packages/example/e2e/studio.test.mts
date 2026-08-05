import fs from 'fs';
import path from 'path';
import {expect, test, type Page} from '@playwright/test';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {STUDIO_URL, effectKeyframeE2eFile, exampleDir} from './constants.mts';
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
	const canvas = page.locator('.remotion-studio-composition-container');
	await expect
		.poll(() =>
			canvas.evaluate((element, data) => {
				const rect = element.getBoundingClientRect();
				const dataTransfer = new DataTransfer();
				dataTransfer.setData(data.mimeType, data.payload);
				const event = new DragEvent('dragover', {
					bubbles: true,
					cancelable: true,
					clientX: rect.left + rect.width / 2,
					clientY: rect.top + rect.height / 2,
					dataTransfer,
				});
				element.dispatchEvent(event);

				return event.defaultPrevented;
			}, dragData),
		)
		.toBe(true);
	await canvas.evaluate((element, data) => {
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

	test('should compensate DOM measurements with useCurrentScale() on direct load', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/use-current-scale-on-load`);
		await expect(
			page.getByTestId('use-current-scale-corrected-width'),
		).toHaveText('100', {timeout: 15_000});
	});

	test('should show the composition list', async ({page}) => {
		await page.goto(STUDIO_URL);
		await expect(page.getByRole('button', {name: 'Schema'})).toBeVisible({
			timeout: 15_000,
		});
	});

	test('untoggling the free license removes it from the config', async ({
		page,
	}) => {
		const configFile = path.join(exampleDir, 'remotion.config.ts');
		const configBeforeTest = fs.readFileSync(configFile, 'utf8');

		try {
			await page.goto(STUDIO_URL);
			const response = await fetch(`${STUDIO_URL}/api/update-config`, {
				method: 'POST',
				headers: {'content-type': 'application/json', origin: STUDIO_URL},
				body: JSON.stringify({
					clientId: 'license-settings-e2e',
					updates: [
						{
							setter: 'setPublicLicenseKey',
							type: 'set',
							value: 'free-license',
						},
					],
				}),
			});
			expect(await response.json()).toEqual({
				success: true,
				data: {success: true},
			});
			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.toContain("Config.setPublicLicenseKey('free-license');");

			await page.getByRole('button', {name: /Search\.\.\./}).click();
			const quickSwitcher = page.getByRole('dialog');
			await quickSwitcher.getByRole('textbox').fill('> Settings');
			await quickSwitcher.getByText('Settings...', {exact: true}).click();
			const dialog = page.getByRole('dialog');
			await dialog.getByText('License', {exact: true}).click();
			const freeLicenseToggle = dialog.locator('input[name="free-license"]');
			await expect(freeLicenseToggle).toBeChecked();
			await freeLicenseToggle.click();

			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.not.toContain('Config.setPublicLicenseKey');
		} finally {
			fs.writeFileSync(configFile, configBeforeTest);
		}
	});

	test('settings reuse reactive runtime config', async ({page}) => {
		const configFile = path.join(exampleDir, 'remotion.config.ts');
		const configBeforeTest = fs.readFileSync(configFile, 'utf8');
		let editorInfoRequests = 0;
		let codingAgentInfoRequests = 0;
		await page.route('**/api/default-editor-info', async (route) => {
			editorInfoRequests++;
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultEditor: null,
						installedEditors: [
							{id: 'vscode', name: 'VS Code'},
							{id: 'cursor', name: 'Cursor'},
						],
					},
				},
			});
		});
		await page.route('**/api/default-coding-agent-info', async (route) => {
			codingAgentInfoRequests++;
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultCodingAgent: null,
						installedCodingAgents: [
							{id: 'codex', iconDataUrl: null, name: 'Codex'},
						],
					},
				},
			});
		});

		try {
			await page.goto(`${STUDIO_URL}/schema-test`);
			await page.locator('[data-sidebar-toggle="right"]').click();
			await expect(
				page.getByRole('group', {name: 'Inspector source location'}).first(),
			).toBeVisible({timeout: 15_000});
			await expect
				.poll(() => ({codingAgentInfoRequests, editorInfoRequests}))
				.toEqual({codingAgentInfoRequests: 1, editorInfoRequests: 1});

			fs.writeFileSync(
				configFile,
				`${configBeforeTest}\nConfig.setDefaultEditor('cursor');\nConfig.setDefaultCodingAgent('codex');\nConfig.setPublicLicenseKey('free-license');\n`,
			);
			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.toContain("Config.setDefaultEditor('cursor');");

			await page.getByRole('button', {name: /Search\.\.\./}).click();
			const quickSwitcher = page.getByRole('dialog');
			await quickSwitcher.getByRole('textbox').fill('> Settings');
			await quickSwitcher.getByText('Settings...', {exact: true}).click();
			const dialog = page.getByRole('dialog');
			await expect(
				dialog.getByTitle('Default editor', {exact: true}),
			).toContainText('Cursor');
			await expect(
				dialog.getByTitle('Default coding agent', {exact: true}),
			).toContainText('Codex');
			await dialog.getByText('License', {exact: true}).click();
			await expect(dialog.locator('input[name="free-license"]')).toBeChecked();
			expect({codingAgentInfoRequests, editorInfoRequests}).toEqual({
				codingAgentInfoRequests: 1,
				editorInfoRequests: 1,
			});
		} finally {
			fs.writeFileSync(configFile, configBeforeTest);
		}
	});

	test('should collapse programmatically duplicated timeline rows', async ({
		page,
	}) => {
		await page.addInitScript(() => {
			window.localStorage.setItem(
				'remotion.sidebarRightCollapsing',
				'expanded',
			);
		});
		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);

		const firstGridline = page.getByText('0% gridline', {exact: true});
		await expect(firstGridline).toBeVisible({timeout: 15_000});
		await expect(
			firstGridline
				.locator('..')
				.getByLabel('4 other programmatically duplicated instances are hidden'),
		).toBeVisible({timeout: 15_000});
		await expect(page.getByText('25% gridline', {exact: true})).toHaveCount(0);
		const visibleOutlines = page.locator(
			'.remotion-studio-composition-container > svg[aria-hidden="true"] > polygon[stroke-opacity="1"]',
		);

		await firstGridline.hover();
		await expect(visibleOutlines).toHaveCount(5);

		const northCanvasLabel = page
			.locator('.remotion-studio-composition-container')
			.getByText('North', {exact: true});
		await northCanvasLabel.hover({force: true});
		await expect(visibleOutlines).toHaveCount(5);
		const centralCanvasLabel = page
			.locator('.remotion-studio-composition-container')
			.getByText('Central', {exact: true});
		const northLabelTitles = page.getByTitle('North label');
		const northLabelTitleCountBeforeSelection = await northLabelTitles.count();
		await centralCanvasLabel.click({force: true});
		await expect(northLabelTitles).toHaveCount(
			northLabelTitleCountBeforeSelection + 1,
		);
		await page.mouse.move(0, 0);
		await expect(visibleOutlines).toHaveCount(5);

		await firstGridline.click();
		const duplicationLabel = page.getByText('5 instances', {
			exact: true,
		});
		await expect(duplicationLabel).toBeVisible();
		await expect(duplicationLabel).toHaveCSS('color', 'rgb(166, 167, 169)');
		await expect(duplicationLabel).toHaveCSS('font-family', 'sans-serif');
		await expect(duplicationLabel).toHaveCSS('font-size', '12px');
		await expect(duplicationLabel).toHaveCSS('font-weight', '400');
		await expect(duplicationLabel).toHaveCSS('line-height', '24px');
		await expect(duplicationLabel).toHaveCSS('margin-top', '2px');
		await expect(duplicationLabel).toHaveCSS('margin-bottom', '2px');

		await page
			.locator('[data-timeline-marquee-item][title="0% gridline"]')
			.click({button: 'right'});
		const duplicateMenuItem = page
			.locator('.__remotion-studio-menu-item')
			.filter({hasText: 'Duplicate'});
		await expect(duplicateMenuItem).toHaveCSS('opacity', '0.5');
		await expect(
			page
				.locator('.__remotion-studio-menu-item')
				.filter({hasText: 'Delete all'}),
		).toBeVisible();
	});

	test('should pass the copied inspector prompt to editable coding agents', async ({
		context,
		page,
	}) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
			origin: STUDIO_URL,
		});
		await page.route('**/api/default-coding-agent-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultCodingAgent: null,
						installedCodingAgents: [
							{id: 'codex', iconDataUrl: null, name: 'Codex'},
							{
								id: 'copilot',
								iconDataUrl: null,
								name: 'GitHub Copilot',
							},
						],
					},
				},
			});
		});

		const launchRequests: unknown[] = [];
		await page.route('**/api/open-in-coding-agent', async (route) => {
			launchRequests.push(route.request().postDataJSON());
			await route.fulfill({
				json: {success: true, data: {success: true}},
			});
		});

		await page.goto(`${STUDIO_URL}/schema-test`);
		await page.locator('[data-sidebar-toggle="right"]').click();
		const sourceLocation = page
			.getByRole('group', {name: 'Inspector source location'})
			.first();
		await expect(sourceLocation).toBeVisible({timeout: 15_000});
		await sourceLocation.hover();

		await sourceLocation
			.getByRole('button', {name: 'Copy location for agents'})
			.click();
		const copiedPrompt = await page.evaluate(() =>
			navigator.clipboard.readText(),
		);
		expect(copiedPrompt.length).toBeGreaterThan(0);

		const openInAnotherApp = sourceLocation.getByRole('button', {
			name: 'Open in another app',
		});
		await openInAnotherApp.click();
		await page.getByRole('button', {name: 'Codex', exact: true}).click();
		await expect.poll(() => launchRequests.length).toBe(1);
		expect(launchRequests[0]).toEqual({
			codingAgentId: 'codex',
			prompt: copiedPrompt,
		});

		await openInAnotherApp.click();
		await page
			.getByRole('button', {name: 'GitHub Copilot', exact: true})
			.click();
		await expect.poll(() => launchRequests.length).toBe(2);
		expect(launchRequests[1]).toEqual({
			codingAgentId: 'copilot',
			prompt: null,
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
		const currentTime = page
			.getByRole('button')
			.filter({hasText: /^\d\d:\d\d\.\d\d/});

		await page.locator('[data-timeline-scrubber]').click();

		await expect(currentTime).not.toHaveAttribute('aria-label', '0');
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
