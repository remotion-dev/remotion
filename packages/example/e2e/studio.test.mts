import fs from 'fs';
import path from 'path';
import {expect, test, type Page} from '@playwright/test';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {
	STUDIO_URL,
	effectKeyframeE2eFile,
	exampleDir,
	lostNodePathE2eFile,
} from './constants.mts';
import {navigateToLostNodePathE2e, navigateToSchemaTest} from './helpers.mts';
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

	test('should keep canvas item context menus open', async ({page}) => {
		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);
		await expect(
			page.getByRole('button', {name: '0', exact: true}),
		).toBeVisible({timeout: 15_000});
		await page.locator('[data-timeline-scrubber]').click();
		await expect(
			page.getByRole('button', {name: '90', exact: true}),
		).toBeVisible();

		const canvasItem = page.getByText('Performance overview', {exact: true});
		const canvasItemBox = await canvasItem.boundingBox();
		if (canvasItemBox === null) {
			throw new Error('Canvas item has no bounding box');
		}

		const canvasItemCenter = {
			x: canvasItemBox.x + canvasItemBox.width / 2,
			y: canvasItemBox.y + canvasItemBox.height / 2,
		};
		await page.mouse.move(canvasItemCenter.x, canvasItemCenter.y);
		await page.waitForTimeout(100);
		await page.mouse.click(canvasItemCenter.x, canvasItemCenter.y, {
			button: 'right',
		});
		await page.mouse.move(10, 10);
		// Portals do not reliably trigger pointerleave in headless Chromium.
		await page
			.locator('.remotion-studio-composition-container')
			.dispatchEvent('pointerleave');

		const duplicateButton = page.getByRole('button', {
			name: 'Duplicate',
			exact: true,
		});
		await expect(duplicateButton).toBeVisible();
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
							{id: 'vscode', name: 'Code', nameWithType: 'Code'},
							{
								id: 'cursor',
								name: 'Cursor',
								nameWithType: 'Cursor Editor',
							},
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
							{
								id: 'codex',
								iconDataUrl: null,
								name: 'Codex',
								nameWithType: 'Codex',
							},
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
			).toHaveText('Cursor');
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

	test('should preserve following interactive elements after deleting a sibling', async ({
		context,
		page,
	}) => {
		await navigateToLostNodePathE2e(page);
		const otherPage = await context.newPage();
		await navigateToLostNodePathE2e(otherPage);
		const canvas = page.locator('.remotion-studio-composition-container');
		const otherCanvas = otherPage.locator(
			'.remotion-studio-composition-container',
		);
		await expect(
			canvas.getByText('Performance overview', {exact: true}),
		).toBeVisible();
		await expect(
			canvas.getByText('Regional growth', {exact: true}),
		).toHaveCount(1);
		await expect(
			canvas.getByText('Bars remain visible', {exact: true}),
		).toBeVisible();
		await expect(
			otherCanvas.getByText('Bars remain visible', {exact: true}),
		).toBeVisible();
		const gridline = page.getByText('0% gridline', {exact: true});
		const gridlineVisibilityToggle = gridline
			.locator('..')
			.locator('..')
			.locator('[data-timeline-layer-eye]');
		const otherGridlineVisibilityToggle = otherPage
			.getByText('0% gridline', {exact: true})
			.locator('..')
			.locator('..')
			.locator('[data-timeline-layer-eye]');
		await expect(gridlineVisibilityToggle).toBeVisible();
		await expect(otherGridlineVisibilityToggle).toBeVisible();
		await page.evaluate(() => {
			const state = window as typeof window & {
				sequenceRemappingBadFrames: string[] | null;
			};
			state.sequenceRemappingBadFrames = [];
			const sample = () => {
				const container = document.querySelector(
					'.remotion-studio-composition-container',
				);
				if (!container) {
					requestAnimationFrame(sample);
					return;
				}

				const regionalGrowthElements = [
					...container.querySelectorAll('*'),
				].filter((element) =>
					[...element.childNodes].some(
						(child) =>
							child.nodeType === Node.TEXT_NODE &&
							child.textContent?.trim() === 'Regional growth',
					),
				);
				if (regionalGrowthElements.length > 1) {
					state.sequenceRemappingBadFrames?.push('duplicate-title');
				}

				if (
					regionalGrowthElements.some(
						(element) =>
							getComputedStyle(element).textTransform === 'uppercase',
					)
				) {
					state.sequenceRemappingBadFrames?.push('uppercase-title');
				}

				const gridline = [...document.querySelectorAll('div')].find(
					(element) =>
						element.childNodes.length === 1 &&
						element.textContent === '0% gridline',
				);
				const gridlineRow = gridline?.parentElement?.parentElement;
				if (
					gridlineRow &&
					!gridlineRow.querySelector('[data-timeline-layer-eye]')
				) {
					state.sequenceRemappingBadFrames?.push(
						'missing-gridline-visibility-toggle',
					);
				}

				requestAnimationFrame(sample);
			};
			requestAnimationFrame(sample);
		});

		const eyebrow = page.locator(
			'[data-timeline-marquee-item][title="Eyebrow"]',
		);
		await eyebrow.click();
		await page.keyboard.press('Delete');

		await expect
			.poll(() => fs.readFileSync(lostNodePathE2eFile, 'utf-8'))
			.not.toContain('name="Eyebrow"');
		await expect(eyebrow).toHaveCount(0, {timeout: 30_000});
		await expect(
			canvas.getByText('Regional growth', {exact: true}),
		).toHaveCount(1);
		await expect(
			canvas.getByText('Bars remain visible', {exact: true}),
		).toBeVisible();
		await expect(
			otherCanvas.getByText('Regional growth', {exact: true}),
		).toHaveCount(1);
		await expect(
			otherCanvas.getByText('Bars remain visible', {exact: true}),
		).toBeVisible();
		await expect(
			page.locator('[data-timeline-marquee-item][title="Title"]'),
		).toBeVisible();
		await expect(
			page.locator('[data-timeline-marquee-item][title="Chart"]'),
		).toBeVisible();
		await expect(gridlineVisibilityToggle).toBeVisible();
		await expect(otherGridlineVisibilityToggle).toBeVisible();

		await page.getByRole('button', {name: /^Undo/}).click();
		await expect
			.poll(() => fs.readFileSync(lostNodePathE2eFile, 'utf-8'))
			.toContain('name="Eyebrow"');
		await expect(eyebrow).toBeVisible({timeout: 30_000});
		await expect(
			canvas.getByText('Performance overview', {exact: true}),
		).toBeVisible();
		await expect(
			canvas.getByText('Regional growth', {exact: true}),
		).toHaveCount(1);
		await expect(
			canvas.getByText('Bars remain visible', {exact: true}),
		).toBeVisible();
		await expect(
			otherCanvas.getByText('Performance overview', {exact: true}),
		).toBeVisible();
		await expect(
			otherCanvas.getByText('Regional growth', {exact: true}),
		).toHaveCount(1);
		await expect(
			otherCanvas.getByText('Bars remain visible', {exact: true}),
		).toBeVisible();
		await expect(gridlineVisibilityToggle).toBeVisible();
		await expect(otherGridlineVisibilityToggle).toBeVisible();

		await page.getByRole('button', {name: /^Redo/}).click();
		await expect
			.poll(() => fs.readFileSync(lostNodePathE2eFile, 'utf-8'))
			.not.toContain('name="Eyebrow"');
		await expect(eyebrow).toHaveCount(0, {timeout: 30_000});
		await expect(
			canvas.getByText('Regional growth', {exact: true}),
		).toHaveCount(1);
		await expect(
			canvas.getByText('Bars remain visible', {exact: true}),
		).toBeVisible();
		await expect(
			otherCanvas.getByText('Regional growth', {exact: true}),
		).toHaveCount(1);
		await expect(
			otherCanvas.getByText('Bars remain visible', {exact: true}),
		).toBeVisible();
		await expect(gridlineVisibilityToggle).toBeVisible();
		await expect(otherGridlineVisibilityToggle).toBeVisible();
		expect(
			await page.evaluate(
				() =>
					(
						window as typeof window & {
							sequenceRemappingBadFrames: string[] | null;
						}
					).sequenceRemappingBadFrames ?? [],
			),
		).toEqual([]);
	});

	test('should use standalone and contextual app names in portaled context menus', async ({
		context,
		page,
	}) => {
		const configFile = path.join(exampleDir, 'remotion.config.ts');
		const configBeforeTest = fs.readFileSync(configFile, 'utf8');
		await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
			origin: STUDIO_URL,
		});
		await page.route('**/api/default-editor-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultEditor: 'cursor',
						installedEditors: [
							{
								id: 'cursor',
								name: 'Cursor',
								nameWithType: 'Cursor Editor',
							},
							{id: 'vscode', name: 'Code', nameWithType: 'Code'},
						],
					},
				},
			});
		});
		await page.route('**/api/default-coding-agent-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultCodingAgent: 'cursor',
						installedCodingAgents: [
							{
								id: 'cursor',
								iconDataUrl: null,
								name: 'Cursor',
								nameWithType: 'Cursor Agent',
							},
							{
								id: 'codex',
								iconDataUrl: null,
								name: 'Codex',
								nameWithType: 'Codex',
							},
						],
					},
				},
			});
		});
		const launchRequests: Array<{
			readonly codingAgentId: string;
			readonly prompt: string | null;
		}> = [];
		await page.route('**/api/open-in-coding-agent', async (route) => {
			launchRequests.push(route.request().postDataJSON());
			await route.fulfill({
				json: {success: true, data: {success: true}},
			});
		});

		try {
			await page.goto(`${STUDIO_URL}/AnimatedBarChart`);
			const firstGridline = page.getByText('0% gridline', {exact: true});
			await expect(firstGridline).toBeVisible({timeout: 15_000});

			fs.writeFileSync(
				configFile,
				`${configBeforeTest}\nConfig.setDefaultEditor('cursor');\nConfig.setDefaultCodingAgent('cursor');\n`,
			);
			await expect
				.poll(() =>
					page.evaluate(() => window.remotion_studioConfig?.defaultCodingAgent),
				)
				.toBe('cursor');
			await page.evaluate(() => {
				window.remotion_editorName = 'Cursor Editor';
			});

			const timelineGridline = page.locator(
				'[data-timeline-marquee-item][title="0% gridline"]',
			);
			await timelineGridline.click({button: 'right'});
			await expect(
				page.getByText('Open in Cursor Editor', {exact: true}),
			).toBeVisible();
			await expect(
				page.getByText('Open in Cursor Agent', {exact: true}),
			).toBeVisible();
			await expect(
				page.getByRole('button', {name: 'Open component docs', exact: true}),
			).toHaveCount(0);
			await page
				.getByRole('button', {name: 'Open in Cursor Agent', exact: true})
				.click();
			await expect.poll(() => launchRequests.length).toBe(1);
			expect(launchRequests[0]?.codingAgentId).toBe('cursor');
			expect(launchRequests[0]?.prompt).toMatch(
				/^0% gridline in src\/BarChart\.tsx:\d+$/,
			);
			const contextForAgents = launchRequests[0]?.prompt;
			await timelineGridline.click({button: 'right'});
			await page
				.getByRole('button', {name: 'Copy context for agents', exact: true})
				.click();
			await expect
				.poll(() => page.evaluate(() => navigator.clipboard.readText()))
				.toBe(contextForAgents);

			fs.writeFileSync(
				configFile,
				`${configBeforeTest}\nConfig.setDefaultEditor('vscode');\nConfig.setDefaultCodingAgent('codex');\n`,
			);
			await expect
				.poll(() =>
					page.evaluate(() => window.remotion_studioConfig?.defaultCodingAgent),
				)
				.toBe('codex');
			await page.evaluate(() => {
				window.remotion_editorName = 'Code';
			});

			await timelineGridline.click({button: 'right'});
			await expect(
				page.getByText('Open in Codex', {exact: true}),
			).toBeVisible();
			await page.getByRole('button', {name: 'Open in...', exact: true}).click();
			await expect(page.getByText('Editors', {exact: true})).toBeVisible();
			await expect(page.getByText('Agents', {exact: true})).toBeVisible();
			await expect(
				page.getByRole('button', {name: 'Cursor', exact: true}),
			).toHaveCount(2);
			await page
				.getByRole('button', {name: 'Change default apps...', exact: true})
				.click();

			const settings = page.getByRole('dialog');
			await expect(settings.getByText('Apps', {exact: true})).toBeVisible();
		} finally {
			fs.writeFileSync(configFile, configBeforeTest);
		}
	});

	test('should dismiss an overflow menu tree with one outside click', async ({
		page,
	}) => {
		await page.setViewportSize({width: 800, height: 904});
		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);
		await expect(page.getByText('0% gridline', {exact: true})).toBeVisible({
			timeout: 15_000,
		});

		await page.evaluate(() => {
			// Keep the menu tree in the interval before the next animation frame to
			// exercise a fast user's outside click deterministically.
			window.requestAnimationFrame = () => 0;
		});
		await page.getByRole('button', {name: 'More actions'}).click();
		const playbackRate = page.getByRole('button', {
			name: 'Playback Rate',
			exact: true,
		});
		await playbackRate.click();
		await expect(
			page.getByRole('button', {name: '1x', exact: true}),
		).toBeVisible();

		await page.mouse.click(10, 100);
		await expect(
			page.getByRole('button', {name: 'Playback Rate', exact: true}),
		).toBeHidden();
	});

	test('should pass the copied inspector context to editable coding agents', async ({
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
							{
								id: 'codex',
								iconDataUrl: null,
								name: 'Codex',
								nameWithType: 'Codex',
							},
							{
								id: 'copilot',
								iconDataUrl: null,
								name: 'GitHub Copilot',
								nameWithType: 'GitHub Copilot',
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
			.getByRole('button', {name: 'Copy context for agents'})
			.click();
		const copiedContext = await page.evaluate(() =>
			navigator.clipboard.readText(),
		);
		expect(copiedContext.length).toBeGreaterThan(0);

		const openInAnotherApp = sourceLocation.getByRole('button', {
			name: 'Open in another app',
		});
		await openInAnotherApp.click();
		await page.getByRole('button', {name: 'Codex', exact: true}).click();
		await expect.poll(() => launchRequests.length).toBe(1);
		expect(launchRequests[0]).toEqual({
			codingAgentId: 'codex',
			prompt: copiedContext,
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

	test('should clear the open-in-editor hover state when closing the menu', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/schema-test`);
		const openInAnotherApp = page
			.getByTitle(exampleDir)
			.getByRole('button', {name: 'Open in another app'});

		await openInAnotherApp.click();
		await expect(
			page.getByRole('button', {name: 'Change default apps...'}),
		).toBeVisible();
		// The menu overlay intercepts pointerleave; Escape closes it deterministically.
		await page.mouse.move(10, 100);
		await page.keyboard.press('Escape');

		await expect(
			page.getByRole('button', {name: 'Change default apps...'}),
		).toBeHidden();
		await expect(openInAnotherApp).toHaveCSS(
			'background-color',
			'rgba(0, 0, 0, 0)',
		);
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
