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

const macCursorsFile = path.join(exampleDir, 'src', 'MacCursors', 'index.tsx');
const outlineSelectionCasesFile = path.join(
	exampleDir,
	'src',
	'VisualModeTests',
	'OutlineSelectionCases.tsx',
);

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

	test('should load the studio without flashing a composition error', async ({
		page,
	}) => {
		await page.addInitScript(() => {
			const state = {compositionNotFoundWasShown: false};
			Object.defineProperty(window, '__remotion_initial_load_test', {
				value: state,
			});

			const observer = new MutationObserver(() => {
				if (
					document.body?.innerText.includes(
						'Composition with ID AnimatedBarChart not found.',
					)
				) {
					state.compositionNotFoundWasShown = true;
				}
			});
			observer.observe(document, {
				childList: true,
				characterData: true,
				subtree: true,
			});
		});

		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);
		await expect(page).toHaveTitle(/Remotion/i, {timeout: 15_000});
		await expect(
			page.locator('.remotion-studio-composition-container'),
		).toBeVisible();
		expect(
			await page.evaluate(
				() =>
					(
						window as typeof window & {
							__remotion_initial_load_test: {
								compositionNotFoundWasShown: boolean;
							};
						}
					).__remotion_initial_load_test.compositionNotFoundWasShown,
			),
		).toBe(false);

		await page.goto(`${STUDIO_URL}/does-not-exist`);
		await expect(
			page.getByText('Composition with ID does-not-exist not found.'),
		).toBeVisible();
	});

	test('should virtualize a large timeline without hiding tracks', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/timeline-virtualization-testbed`);
		await expect(page).toHaveURL(/timeline-virtualization-testbed/, {
			timeout: 15_000,
		});

		const timelineScroll = page
			.locator('.__remotion-vertical-scrollbar')
			.filter({has: page.locator('[data-timeline-scrollable]')});
		await expect(timelineScroll).toHaveCount(1);
		await expect(
			page.getByText('Virtual track 000', {exact: true}),
		).toBeVisible();
		await expect(
			page.locator('[data-timeline-marquee-item][title="Virtual track 000"]'),
		).toBeVisible();

		const mountedTrackLabels = page.getByText(/^Virtual track \d{3}$/);
		expect(await mountedTrackLabels.count()).toBeLessThan(120);

		const revealTargetTrack = page.locator(
			'[data-timeline-marquee-item][title="Reveal target"]',
		);
		await expect(revealTargetTrack).toHaveCount(0);
		const canvas = page.locator('.remotion-studio-composition-container');
		const visibleOutlines = canvas.locator(
			'> svg[aria-hidden="true"] polygon[stroke="#0b84f3"][stroke-opacity="1"]',
		);
		await canvas.hover();
		await expect.poll(() => visibleOutlines.count()).toBeGreaterThan(0);
		await visibleOutlines.first().click({force: true});

		await expect(revealTargetTrack).toBeVisible();
		const [revealTargetRect, timelineScrollRect] = await Promise.all([
			revealTargetTrack.boundingBox(),
			timelineScroll.boundingBox(),
		]);
		expect(revealTargetRect).not.toBeNull();
		expect(timelineScrollRect).not.toBeNull();
		expect(revealTargetRect!.y).toBeGreaterThanOrEqual(timelineScrollRect!.y);
		expect(revealTargetRect!.y + revealTargetRect!.height).toBeLessThanOrEqual(
			timelineScrollRect!.y + timelineScrollRect!.height,
		);
		await expect(
			page.getByText('Virtual track 119', {exact: true}),
		).toBeVisible();
		await expect(
			page.locator('[data-timeline-marquee-item][title="Virtual track 119"]'),
		).toBeVisible();
		expect(
			await timelineScroll.evaluate((element) => element.scrollTop),
		).toBeGreaterThan(0);
		expect(await mountedTrackLabels.count()).toBeLessThan(120);
	});

	test('should commit a color drag before the picker closes', async ({
		page,
	}) => {
		const barChartFile = path.join(exampleDir, 'src', 'BarChart.tsx');
		const originalSource = fs.readFileSync(barChartFile, 'utf-8');

		try {
			await page.goto(`${STUDIO_URL}/AnimatedBarChart`);
			await expect(page).toHaveURL(/AnimatedBarChart/, {timeout: 15_000});

			if (!(await page.getByRole('button', {name: 'Inspector'}).isVisible())) {
				await page.locator('[data-sidebar-toggle="right"]').click();
			}

			const colorButton = page
				.getByRole('button', {name: '#000', exact: true})
				.first();
			await expect(async () => {
				await page
					.locator('[data-timeline-marquee-item][title="North bar"]')
					.click();
				await expect(colorButton).toBeVisible({timeout: 1_000});
			}).toPass({timeout: 15_000});
			await colorButton.click();

			const hexInput = page.getByRole('textbox', {name: 'Hex'});
			await expect(hexInput).toBeVisible();
			const saturationValueArea = page.locator(
				'div[style*="cursor: crosshair"]',
			);
			const box = await saturationValueArea.boundingBox();
			if (box === null) {
				throw new Error('Color picker saturation area has no bounding box');
			}

			await page.mouse.move(
				box.x + box.width * 0.25,
				box.y + box.height * 0.75,
			);
			await page.mouse.down();
			await page.mouse.move(
				box.x + box.width * 0.75,
				box.y + box.height * 0.25,
			);
			await page.mouse.up();

			await expect(hexInput).toBeVisible();
			await expect
				.poll(() => fs.readFileSync(barChartFile, 'utf-8'))
				.toMatch(/position: 'relative',\n\s+color: '#[0-9a-f]{6}',/);
			await expect(page.getByRole('button', {name: /^Undo/})).toBeEnabled();
			await page.keyboard.press('ControlOrMeta+z');

			await expect
				.poll(() => fs.readFileSync(barChartFile, 'utf-8'))
				.toBe(originalSource);
			await expect(hexInput).toHaveValue('#000000');
		} finally {
			fs.writeFileSync(barChartFile, originalSource);
		}
	});

	test('should preserve the sequence inspector scroll position when adding an effect', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		await expect(page).toHaveURL(/effect-keyframe-e2e/, {timeout: 15_000});
		const addEffectButton = page.getByTitle('Add effect', {exact: true});
		if (!(await page.getByRole('button', {name: 'Inspector'}).isVisible())) {
			await page.locator('[data-sidebar-toggle="right"]').click();
		}

		await expect(async () => {
			await page.getByTitle('Scale precision', {exact: true}).first().click();
			await expect(addEffectButton).toBeVisible({timeout: 1000});
		}).toPass({timeout: 15_000});
		const inspector = page
			.locator('.__remotion-vertical-scrollbar')
			.filter({has: addEffectButton});
		await expect(inspector).toHaveCount(1);
		await inspector.evaluate((element) => {
			element.scrollTop = element.scrollHeight;
		});
		await addEffectButton.click();

		const scrollTopBefore = await inspector.evaluate(
			(element) => element.scrollTop,
		);
		expect(scrollTopBefore).toBeGreaterThan(0);
		const effectPicker = page.getByRole('dialog');
		await effectPicker.getByPlaceholder('Search effects...').fill('blur');
		await effectPicker.getByText('blur()', {exact: true}).click();

		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf-8'))
			.toContain("import {blur} from '@remotion/effects/blur';");
		await expect(page.getByText('blur()', {exact: true})).toBeVisible();
		const scrollTopAfter = await inspector.evaluate(
			(element) => element.scrollTop,
		);
		expect(scrollTopAfter).toBeGreaterThan(0);
	});

	test('should copy a keyframed property between component types', async ({
		context,
		page,
	}) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
			origin: STUDIO_URL,
		});
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		await page.bringToFront();
		await page.evaluate(() => navigator.clipboard.writeText(''));
		const sourceRow = page.locator(
			'[data-timeline-marquee-item][title="Copy rotation source"]',
		);
		const targetRow = page.locator(
			'[data-timeline-marquee-item][title="Copy rotation target"]',
		);
		await expect(sourceRow).toBeVisible({timeout: 15_000});
		await expect(targetRow).toBeVisible({timeout: 15_000});
		const rotateButton = page.getByRole('button', {
			name: 'Rotate',
			exact: true,
		});
		await expect(async () => {
			await page
				.getByTitle('Copy rotation source', {exact: true})
				.first()
				.click({button: 'right'});
			await expect(rotateButton).toBeVisible({timeout: 1000});
		}).toPass({timeout: 15_000});
		await rotateButton.click();
		await page.keyboard.press('ControlOrMeta+c');

		await expect(async () => {
			await page
				.getByTitle('Copy rotation target', {exact: true})
				.first()
				.click({button: 'right'});
			await expect(rotateButton).toBeVisible({timeout: 1000});
		}).toPass({timeout: 15_000});
		await rotateButton.click();
		await page.keyboard.press('ControlOrMeta+v');

		await expect
			.poll(() => {
				const source = fs.readFileSync(effectKeyframeE2eFile, 'utf-8');
				const targetNameIndex = source.indexOf('name="Copy rotation target"');
				const tagStart = source.lastIndexOf('<AbsoluteFill', targetNameIndex);
				const tagEnd = source.indexOf('/>', targetNameIndex);
				return source.slice(tagStart, tagEnd + 2);
			})
			.toContain("rotate: interpolate(frame, [0, 30], ['0deg', '90deg'])");

		await page.getByRole('button', {name: /^Undo/}).click();
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf-8'))
			.toContain(
				'<AbsoluteFill name="Copy rotation target" style={{rotate: \'0deg\'}} />',
			);
	});

	test('should toggle the visibility of a macOS cursor', async ({page}) => {
		const originalSource = fs.readFileSync(macCursorsFile, 'utf-8');

		try {
			await page.goto(`${STUDIO_URL}/mac-cursors`);
			const cursorLabel = page
				.getByText('Hideable cursor', {exact: true})
				.first();
			const visibilityToggle = cursorLabel
				.locator('..')
				.locator('..')
				.locator('[data-timeline-layer-eye]');
			await expect(async () => {
				await expect(cursorLabel).toBeVisible({timeout: 1000});
				await expect(visibilityToggle).toBeVisible({timeout: 1000});
			}).toPass({timeout: 15_000});

			await visibilityToggle.click();
			await expect
				.poll(() => {
					const source = fs.readFileSync(macCursorsFile, 'utf-8');
					const cursorNameIndex = source.indexOf('name="Hideable cursor"');
					const tagStart = source.lastIndexOf('<MacOSCursor', cursorNameIndex);
					const tagEnd = source.indexOf('/>', cursorNameIndex);
					return source.slice(tagStart, tagEnd + 2);
				})
				.toContain('hidden');
		} finally {
			fs.writeFileSync(macCursorsFile, originalSource);
		}
	});

	test('should only open the editor from non-interactive inspector content', async ({
		page,
	}) => {
		await page.addInitScript(() => {
			window.localStorage.setItem(
				'remotion.sidebarRightCollapsing',
				'expanded',
			);
			Object.defineProperty(window, 'remotion_editorName', {
				configurable: true,
				get: () => 'Test editor',
				set: () => undefined,
			});
		});
		await page.route('**/api/default-editor-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultEditor: 'vscode',
						installedEditors: [
							{
								id: 'vscode',
								name: 'Test editor',
								nameWithType: 'Test editor',
							},
						],
					},
				},
			});
		});
		const openInEditorRequests: unknown[] = [];
		await page.route('**/api/open-in-editor', async (route) => {
			openInEditorRequests.push(route.request().postDataJSON());
			await route.fulfill({
				json: {success: true, data: {success: true}},
			});
		});

		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);
		const eyebrow = page.getByText('Eyebrow', {exact: true}).first();
		await expect(eyebrow).toBeVisible({timeout: 15_000});
		const textField = page.getByRole('textbox');
		await expect(async () => {
			await eyebrow.click();
			await expect(textField).toHaveValue('Performance overview', {
				timeout: 1_000,
			});
		}).toPass({timeout: 30_000});

		await page.getByTitle('Text', {exact: true}).dblclick();
		await expect.poll(() => openInEditorRequests.length).toBe(1);
		openInEditorRequests.length = 0;

		await textField.dblclick({position: {x: 20, y: 20}});
		await expect
			.poll(() =>
				textField.evaluate((element) =>
					element.value.slice(element.selectionStart, element.selectionEnd),
				),
			)
			.toBe('overview');
		// Headless Chromium does not consistently emit dblclick after selecting text.
		await textField.dispatchEvent('dblclick');
		const numberDragger = page
			.locator('button.__remotion_input_dragger')
			.first();
		await expect(numberDragger).toBeVisible();
		await numberDragger.dispatchEvent('dblclick');
		const colorPicker = page.getByTitle('#8E9AB8', {exact: true});
		await expect(colorPicker).toBeVisible();
		await colorPicker.dispatchEvent('dblclick');

		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);
		const scaleEffectRow = page.getByText('scale()', {exact: true});
		await expect(async () => {
			await page.getByTitle('Scale precision', {exact: true}).first().click();
			await expect(scaleEffectRow).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 15_000});
		await scaleEffectRow.click();
		const horizontalCheckbox = page.locator('input[name="horizontal"]');
		await expect(horizontalCheckbox).toBeVisible();
		await horizontalCheckbox.dispatchEvent('dblclick');
		await page.waitForTimeout(100);
		expect(openInEditorRequests).toEqual([]);
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
		await canvasItem.hover();
		const canvasItemOutline = page.locator(
			'polygon[data-remotion-prevent-selection-clear="true"][stroke-opacity="1"]',
		);
		await expect(canvasItemOutline).toHaveCount(1);
		await canvasItemOutline.click({button: 'right'});

		const duplicateButton = page.getByRole('button', {
			name: 'Duplicate',
			exact: true,
		});
		await expect(duplicateButton).toBeVisible();

		await page.mouse.move(10, 10);
		// Portals do not reliably trigger pointerleave in headless Chromium.
		await page
			.locator('.remotion-studio-composition-container')
			.dispatchEvent('pointerleave');
		await expect(duplicateButton).toBeVisible();
	});

	test('should preserve property selection while dragging its outline', async ({
		page,
	}) => {
		test.setTimeout(120_000);
		const sourceBefore = fs.readFileSync(outlineSelectionCasesFile, 'utf-8');

		try {
			await page.goto(`${STUDIO_URL}/outline-selection-cases`);
			await page.waitForFunction(
				() => !document.body.innerText.includes('Loading...'),
				{timeout: 30_000},
			);
			await page.keyboard.press('g');
			const currentFrameInput = page.locator('input:focus');
			await expect(currentFrameInput).toBeVisible();
			await currentFrameInput.fill('2010');
			await currentFrameInput.press('Enter');

			const canvas = page.locator('.remotion-studio-composition-container');
			const target = canvas
				.getByText('Select one of my properties, then drag me', {exact: true})
				.locator('..');
			await expect(target).toBeVisible({timeout: 15_000});
			await expect(page.getByText('Baseline', {exact: true})).toBeVisible();

			const timelineItem = page
				.getByTitle('Property-selected sequence', {exact: true})
				.first();
			const offsetProperty = page.getByTitle('Offset', {exact: true});
			await expect(async () => {
				await expect(timelineItem).toBeVisible({timeout: 1000});
				await timelineItem.click();
				await page.keyboard.press('p');
				await expect(offsetProperty).toBeVisible({timeout: 1000});
			}).toPass({timeout: 15_000});
			await offsetProperty.click();
			const offsetSelection = offsetProperty.locator('..');
			await expect(offsetSelection).toHaveCSS(
				'background-color',
				'rgba(255, 255, 255, 0.1)',
			);

			const outline = canvas.locator(
				'> svg[aria-hidden="true"] polygon[data-remotion-prevent-selection-clear="true"][stroke-opacity="1"]',
			);
			await expect(outline).toHaveCount(1);

			const targetBefore = await target.boundingBox();
			const outlineBefore = await outline.boundingBox();
			if (targetBefore === null || outlineBefore === null) {
				throw new Error('Expected the selected outline to have a bounding box');
			}

			const dragStart = {
				x: outlineBefore.x + outlineBefore.width / 2,
				y: outlineBefore.y + outlineBefore.height / 2,
			};
			await page.mouse.move(dragStart.x, dragStart.y);
			await page.mouse.down();
			await expect(offsetSelection).toHaveCSS(
				'background-color',
				'rgba(255, 255, 255, 0.1)',
			);
			await page.mouse.move(dragStart.x + 60, dragStart.y, {steps: 5});
			await page.mouse.up();

			await expect
				.poll(async () => (await target.boundingBox())?.x ?? null)
				.toBeCloseTo(targetBefore.x + 60, 0);
			await expect(offsetSelection).toHaveCSS(
				'background-color',
				'rgba(255, 255, 255, 0.1)',
			);
			await expect
				.poll(() => {
					const source = fs.readFileSync(outlineSelectionCasesFile, 'utf-8');
					const targetIndex = source.indexOf(
						'name="Property-selected sequence"',
					);
					return source
						.slice(targetIndex, targetIndex + 1000)
						.match(/translate: '([^']+)'/)?.[1];
				})
				.not.toBe('0px 0px');
		} finally {
			fs.writeFileSync(outlineSelectionCasesFile, sourceBefore);
		}
	});

	test('should compensate DOM measurements with useCurrentScale() on direct load', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/use-current-scale-on-load`);
		await expect(
			page.getByTestId('use-current-scale-corrected-width'),
		).toHaveText('100', {timeout: 15_000});
	});

	test('should show and search the composition list', async ({page}) => {
		await page.goto(STUDIO_URL);
		await expect(page.getByRole('button', {name: 'Schema'})).toBeVisible({
			timeout: 15_000,
		});

		await page.keyboard.press('ControlOrMeta+k');
		await page
			.getByPlaceholder('Search compositions...')
			.fill('timeline virtualization');
		await page.keyboard.press('Enter');
		await expect(page).toHaveURL(/timeline-virtualization-testbed/);
	});

	test('should play when a composition in the sidebar is focused', async ({
		page,
	}) => {
		await navigateToSchemaTest(page);

		const otherComposition = page.getByTitle('AnimatedBarChart', {exact: true});
		await otherComposition.press('Space');

		await expect(page.getByRole('button', {name: 'Pause'})).toBeVisible();
		await expect(page).toHaveURL(/schema-test/);
	});

	test('should navigate to a newly created composition', async ({page}) => {
		const compositionId = 'NewlyCreatedComposition';
		const compositionFile = path.join(
			exampleDir,
			'src',
			`${compositionId}.tsx`,
		);

		try {
			await page.goto(`${STUDIO_URL}/schema-test`);
			await expect(page).toHaveTitle(/schema-test/, {timeout: 15_000});

			await page.getByRole('button', {name: 'File', exact: true}).click();
			await page
				.getByRole('button', {name: 'New composition...', exact: true})
				.click();
			await page
				.getByRole('textbox', {name: 'Composition ID'})
				.fill(compositionId);

			const createButton = page.getByRole('button', {
				name: /Add to .*/,
			});
			await expect(createButton).toBeEnabled();
			await createButton.click();

			await expect(page).toHaveURL(`${STUDIO_URL}/${compositionId}`, {
				timeout: 5_000,
			});
			await expect(page).toHaveTitle(new RegExp(compositionId), {
				timeout: 5_000,
			});
		} finally {
			const undoButton = page.getByRole('button', {name: /^Undo/});
			if (await undoButton.isEnabled()) {
				await undoButton.click();
				await expect.poll(() => fs.existsSync(compositionFile)).toBe(false);
			}
		}
	});

	test('settings reuse reactive runtime config and license toggle', async ({
		page,
	}) => {
		test.setTimeout(120_000);
		const configFile = path.join(exampleDir, 'remotion.config.ts');
		const configBeforeTest = fs.readFileSync(configFile, 'utf8');
		let editorInfoRequests = 0;
		let codingAgentInfoRequests = 0;
		let updateConfigRequests = 0;
		page.on('request', (request) => {
			if (new URL(request.url()).pathname === '/api/update-config') {
				updateConfigRequests++;
			}
		});
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
								name: 'Codex',
								nameWithType: 'Codex',
							},
						],
						installedTerminals: [{id: 'ghostty', name: 'Ghostty'}],
					},
				},
			});
		});
		await page.route('**/api/remotion-skills-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {
						remotionUpgradeSkillAvailable: false,
						remotionInteractivitySkillAvailable: false,
						skills: [
							{
								name: 'remotion-best-practices',
								installedInProject: true,
								installedGlobally: false,
							},
							{
								name: 'remotion-captions',
								installedInProject: false,
								installedGlobally: false,
							},
							{
								name: 'remotion-create',
								installedInProject: false,
								installedGlobally: false,
							},
							{
								name: 'remotion-docs',
								installedInProject: false,
								installedGlobally: true,
							},
							{
								name: 'remotion-interactivity',
								installedInProject: false,
								installedGlobally: false,
							},
							{
								name: 'remotion-maps',
								installedInProject: false,
								installedGlobally: false,
							},
							{
								name: 'remotion-markup',
								installedInProject: false,
								installedGlobally: false,
							},
							{
								name: 'remotion-multimedia',
								installedInProject: false,
								installedGlobally: false,
							},
							{
								name: 'remotion-render',
								installedInProject: false,
								installedGlobally: false,
							},
							{
								name: 'remotion-saas',
								installedInProject: false,
								installedGlobally: false,
							},
							{
								name: 'remotion-studio',
								installedInProject: false,
								installedGlobally: false,
							},
							{
								name: 'remotion-upgrade',
								installedInProject: false,
								installedGlobally: false,
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
				dialog.getByText('Default codec', {exact: true}),
			).toBeVisible();
			await expect(
				dialog.getByText('Output location', {exact: true}),
			).toHaveCount(0);
			await expect(
				dialog.getByText('Audio bitrate', {exact: true}),
			).toHaveCount(0);
			const stillImageFormat = dialog.getByTitle('Still image format', {
				exact: true,
			});
			await expect(stillImageFormat).toHaveText('Default (PNG)');
			await stillImageFormat.click();
			await page.getByRole('button', {name: 'JPEG', exact: true}).click();
			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.toContain("Config.setStillImageFormat('jpeg');");
			await expect(stillImageFormat).toHaveText('JPEG');
			await stillImageFormat.click();
			await page
				.getByRole('button', {
					name: 'Default (PNG)',
					exact: true,
				})
				.last()
				.click();
			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.not.toContain('Config.setStillImageFormat');
			await expect(stillImageFormat).toHaveText('Default (PNG)');
			const audioCodec = dialog.getByTitle('Audio codec', {exact: true});
			await expect(audioCodec).toHaveText('Default (Automatic)');
			await audioCodec.click();
			const automaticAudioCodec = page
				.getByRole('button', {
					name: 'Default (Automatic)',
					exact: true,
				})
				.last();
			const aacAudioCodec = page
				.getByRole('button', {
					name: 'AAC',
					exact: true,
				})
				.last();
			await expect(automaticAudioCodec.getByRole('img')).toHaveCount(1);
			await expect(aacAudioCodec.getByRole('img')).toHaveCount(0);
			await aacAudioCodec.click();
			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.toContain("Config.setAudioCodec('aac');");
			await expect(audioCodec).toHaveText('AAC');
			await audioCodec.click();
			await expect(automaticAudioCodec.getByRole('img')).toHaveCount(0);
			await expect(aacAudioCodec.getByRole('img')).toHaveCount(1);
			await automaticAudioCodec.click();
			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.not.toContain('Config.setAudioCodec');
			await expect(audioCodec).toHaveText('Default (Automatic)');
			await dialog.getByText('Studio', {exact: true}).click();
			for (const setting of [
				'Ask AI enabled',
				'Keyboard shortcuts enabled',
				'Interactivity enabled',
				'Max timeline tracks',
				'Audio latency hint',
				'Number of shared audio tags',
				'Beep on finish',
				'Bundler',
				'Cross-site isolation',
				'Log level',
			]) {
				await expect(dialog.getByText(setting, {exact: true})).toBeVisible();
			}
			await expect(
				dialog.getByRole('button', {name: 'Number of shared audio tags'}),
			).toBeVisible();

			const askAIEnabled = dialog.getByTitle('Ask AI enabled', {exact: true});
			await expect(askAIEnabled).toHaveText('Default (Enabled)');
			await askAIEnabled.click();
			await page
				.getByRole('button', {name: 'Disabled', exact: true})
				.last()
				.click();
			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.toContain('Config.setAskAIEnabled(false);');
			await askAIEnabled.click();
			await page
				.getByRole('button', {name: 'Default (Enabled)', exact: true})
				.last()
				.click();
			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.not.toContain('Config.setAskAIEnabled');

			const maxTimelineTracks = dialog.getByRole('button', {
				name: 'Max timeline tracks',
			});
			const maxTimelineTracksBounds = await maxTimelineTracks.boundingBox();
			expect(maxTimelineTracksBounds).not.toBeNull();
			const requestsBeforeDrag = updateConfigRequests;
			await page.mouse.move(
				maxTimelineTracksBounds!.x + maxTimelineTracksBounds!.width / 2,
				maxTimelineTracksBounds!.y + maxTimelineTracksBounds!.height / 2,
			);
			await page.mouse.down();
			for (let step = 1; step <= 6; step++) {
				await page.mouse.move(
					maxTimelineTracksBounds!.x +
						maxTimelineTracksBounds!.width / 2 +
						step * 3,
					maxTimelineTracksBounds!.y + maxTimelineTracksBounds!.height / 2,
				);
				await page.waitForTimeout(80);
			}
			expect(updateConfigRequests).toBe(requestsBeforeDrag);
			await page.mouse.up();
			await expect
				.poll(() => updateConfigRequests)
				.toBe(requestsBeforeDrag + 1);
			await page.waitForTimeout(500);
			expect(updateConfigRequests).toBe(requestsBeforeDrag + 1);
			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.toContain('Config.setMaxTimelineTracks(');
			await dialog.getByTitle('Use default (Unlimited)', {exact: true}).click();
			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.not.toContain('Config.setMaxTimelineTracks');
			await expect(maxTimelineTracks).toHaveText('Default (Unlimited)');

			await dialog.getByText('Skills', {exact: true}).click();
			await expect(
				dialog.getByText(
					'Not all skills are installed. Run this command in the project directory, then reload Studio and restart your coding agent.',
					{exact: true},
				),
			).toBeVisible();
			await expect(
				dialog.getByText('/remotion-best-practices', {exact: true}),
			).toBeVisible();
			await expect(
				dialog.getByText('/remotion-docs', {exact: true}),
			).toBeVisible();
			await expect(
				dialog.getByText('/remotion-studio', {exact: true}),
			).toBeVisible();
			await expect(dialog.getByText('Project', {exact: true})).toBeVisible();
			await expect(dialog.getByText('Global', {exact: true})).toBeVisible();
			await expect(
				dialog.getByText('Not installed', {exact: true}).first(),
			).toBeVisible();
			await expect(
				dialog.getByText('npx remotion skills add', {exact: true}),
			).toBeVisible();
			await expect(
				dialog.getByRole('button', {name: 'Copy install command'}),
			).toBeVisible();
			const skillsList = dialog.getByRole('list', {
				name: 'Remotion Agent Skills',
			});
			const skillsScrollContainer = skillsList.locator('..').locator('..');
			await skillsScrollContainer.evaluate((element) => {
				element.scrollTop = element.scrollHeight;
			});
			const skillsScrollContainerBounds =
				await skillsScrollContainer.boundingBox();
			const lastSkillBounds = await skillsList
				.getByRole('listitem')
				.last()
				.boundingBox();
			expect(
				skillsScrollContainerBounds!.y +
					skillsScrollContainerBounds!.height -
					(lastSkillBounds!.y + lastSkillBounds!.height),
			).toBeGreaterThanOrEqual(16);
			await expect(
				dialog.getByText('Changes save to', {exact: false}),
			).toBeVisible();

			await dialog.getByText('Apps', {exact: true}).click();
			await expect(
				dialog.getByTitle('Default editor', {exact: true}),
			).toHaveText('Cursor');
			await expect(
				dialog.getByTitle('Default coding agent', {exact: true}),
			).toContainText('Codex');
			await dialog.getByText('License', {exact: true}).click();
			const freeLicenseToggle = dialog.locator('input[name="free-license"]');
			await expect(freeLicenseToggle).toBeChecked();
			expect({codingAgentInfoRequests, editorInfoRequests}).toEqual({
				codingAgentInfoRequests: 1,
				editorInfoRequests: 1,
			});
			await freeLicenseToggle.click();
			await expect
				.poll(() => fs.readFileSync(configFile, 'utf8'))
				.not.toContain('Config.setPublicLicenseKey');
			await page.mouse.move(10, 100);
			await page.mouse.down();
			await page.mouse.move(13, 101);
			await page.mouse.up();
			await expect(dialog).toBeHidden();
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

	test('should keep selected canvas outlines visible outside the canvas', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);

		const firstGridline = page.getByText('0% gridline', {exact: true});
		await expect(firstGridline).toBeVisible({timeout: 15_000});

		const canvas = page.locator('.remotion-studio-composition-container');
		const visibleOutlines = page.locator(
			'.remotion-studio-composition-container > svg[aria-hidden="true"] polygon[stroke="#0b84f3"][stroke-opacity="1"]',
		);
		await canvas.hover();
		await expect.poll(() => visibleOutlines.count()).toBeGreaterThan(0);
		await visibleOutlines.first().click({force: true});
		await page.mouse.move(0, 0);
		await expect.poll(() => visibleOutlines.count()).toBeGreaterThan(0);
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

	test('should use an explicit editor or fall back to an installed editor', async ({
		page,
	}) => {
		await page.addInitScript(() => {
			Object.defineProperty(window, 'remotion_editorName', {
				configurable: true,
				get: () => null,
				set: () => undefined,
			});
		});
		await page.route('**/api/default-editor-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultEditor: null,
						installedEditors: [
							{
								id: 'cursor',
								name: 'Cursor',
								nameWithType: 'Cursor Editor',
							},
							{id: 'vscode', name: 'Code', nameWithType: 'Code'},
							{id: 'zed', name: 'Zed', nameWithType: 'Zed'},
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
						defaultCodingAgent: null,
						installedCodingAgents: [],
						installedTerminals: [],
					},
				},
			});
		});
		const openInEditorRequests: unknown[] = [];
		await page.route('**/api/open-in-editor', async (route) => {
			openInEditorRequests.push(route.request().postDataJSON());
			await route.fulfill({
				json: {success: true, data: {success: true}},
			});
		});

		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);
		const projectLocation = page.getByTitle(exampleDir);
		const primaryOpenInZed = projectLocation.getByRole('button', {
			name: 'Open in Zed',
			exact: true,
		});
		await expect(primaryOpenInZed).toBeVisible({timeout: 15_000});
		await expect(primaryOpenInZed).toBeEnabled();

		await projectLocation
			.getByRole('button', {name: 'Open in another app', exact: true})
			.click();
		await expect(
			page.getByRole('button', {name: 'Cursor', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Code', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Zed', exact: true}),
		).toHaveCount(0);

		await page.getByRole('button', {name: 'Code', exact: true}).click();
		await expect
			.poll(() => openInEditorRequests)
			.toEqual([
				expect.objectContaining({
					editorId: 'vscode',
				}),
			]);
		await expect(
			page.getByRole('button', {name: 'Cursor', exact: true}),
		).toBeHidden();
		await primaryOpenInZed.click();
		await expect
			.poll(() => openInEditorRequests)
			.toEqual([
				expect.objectContaining({
					editorId: 'vscode',
				}),
				expect.objectContaining({
					editorId: 'zed',
				}),
			]);

		const timelineGridline = page.locator(
			'[data-timeline-marquee-item][title="0% gridline"]',
		);
		await timelineGridline.click();
		await page.locator('[data-sidebar-toggle="right"]').click();
		const sourceLocation = page
			.getByRole('group', {name: 'Inspector source location'})
			.first();
		await expect(sourceLocation).toBeVisible();
		const sourceLink = sourceLocation.getByRole('button', {
			name: /BarChart\.tsx:\d+/,
		});
		await expect(sourceLink).toBeEnabled();
		await sourceLink.click();
		await expect
			.poll(() => openInEditorRequests)
			.toEqual([
				expect.objectContaining({
					editorId: 'vscode',
				}),
				expect.objectContaining({
					editorId: 'zed',
				}),
				expect.objectContaining({
					editorId: 'zed',
				}),
			]);

		await timelineGridline.click({button: 'right'});
		const sequenceContextMenu = page
			.locator('[data-remotion-menu-tree-id]')
			.last();
		const contextMenuOpenInZed = sequenceContextMenu.getByRole('button', {
			name: 'Open in Zed',
			exact: true,
		});
		await expect(contextMenuOpenInZed).toBeEnabled();
		await contextMenuOpenInZed.click();
		await expect
			.poll(() => openInEditorRequests)
			.toEqual([
				expect.objectContaining({
					editorId: 'vscode',
				}),
				expect.objectContaining({
					editorId: 'zed',
				}),
				expect.objectContaining({
					editorId: 'zed',
				}),
				expect.objectContaining({
					editorId: 'zed',
				}),
			]);
	});

	test('should disable opening when no editor is installed', async ({page}) => {
		await page.addInitScript(() => {
			Object.defineProperty(window, 'remotion_editorName', {
				configurable: true,
				get: () => null,
				set: () => undefined,
			});
		});
		await page.route('**/api/default-editor-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {defaultEditor: null, installedEditors: []},
				},
			});
		});
		await page.route('**/api/default-coding-agent-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultCodingAgent: null,
						installedCodingAgents: [],
						installedTerminals: [],
					},
				},
			});
		});

		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);
		const projectLocation = page.getByTitle(exampleDir);
		await projectLocation.hover();
		await expect(
			projectLocation.getByRole('button', {
				name: 'Open in default editor',
				exact: true,
			}),
		).toBeDisabled({timeout: 15_000});

		if (!(await page.getByRole('button', {name: 'Inspector'}).isVisible())) {
			await page.locator('[data-sidebar-toggle="right"]').click();
		}
		const sourceLocation = page
			.getByRole('group', {name: 'Inspector source location'})
			.first();
		await expect(sourceLocation).toBeVisible();
		await expect(
			sourceLocation.getByRole('button', {name: /\.tsx:\d+/}).first(),
		).toBeDisabled();
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
								name: 'Cursor',
								nameWithType: 'Cursor Agent',
							},
							{
								id: 'codex',
								name: 'Codex',
								nameWithType: 'Codex',
							},
						],
						installedTerminals: [
							{id: 'terminal', name: 'Terminal'},
							{id: 'iterm2', name: 'iTerm2'},
							{id: 'windows-terminal', name: 'Windows Terminal'},
						],
					},
				},
			});
		});
		const launchRequests: Array<{
			readonly codingAgentId: string;
			readonly prompt: string | null;
		}> = [];
		const terminalLaunchRequests: Array<{
			readonly directory: string;
			readonly terminalId: string;
		}> = [];
		await page.route('**/api/open-in-coding-agent', async (route) => {
			launchRequests.push(route.request().postDataJSON());
			await route.fulfill({
				json: {success: true, data: {success: true}},
			});
		});
		await page.route('**/api/open-in-terminal', async (route) => {
			terminalLaunchRequests.push(route.request().postDataJSON());
			await route.fulfill({
				json: {success: true, data: {success: true}},
			});
		});

		try {
			await page.goto(`${STUDIO_URL}/AnimatedBarChart`);
			const firstGridline = page.getByText('0% gridline', {exact: true});
			await expect(firstGridline).toBeVisible({timeout: 15_000});
			const projectOpenInAnotherApp = page
				.getByTitle(exampleDir)
				.getByRole('button', {name: 'Open in another app'});
			await projectOpenInAnotherApp.click();
			const terminalButton = page.getByRole('button', {
				name: 'Terminal',
				exact: true,
			});
			const iTermButton = page.getByRole('button', {
				name: 'iTerm2',
				exact: true,
			});
			const windowsTerminalButton = page.getByRole('button', {
				name: 'Windows Terminal',
				exact: true,
			});
			await expect(page.getByText('Editor', {exact: true})).toBeVisible();
			await expect(page.getByText('Agent', {exact: true})).toBeVisible();
			await expect(page.getByText('Terminal', {exact: true})).toHaveCount(2);
			await expect(iTermButton).toBeVisible();
			await expect(windowsTerminalButton).toBeVisible();
			await expect(page.getByText('Editors', {exact: true})).toHaveCount(0);
			await expect(page.getByText('Agents', {exact: true})).toHaveCount(0);
			const terminalIcon = terminalButton.locator(
				'img[data-terminal-icon="terminal"]',
			);
			await expect(terminalIcon).toHaveAttribute(
				'src',
				'/api/app-icon/terminal/terminal.png',
			);
			await expect
				.poll(() =>
					terminalIcon.evaluate(
						(image) => (image as HTMLImageElement).naturalWidth,
					),
				)
				.toBe(72);
			await terminalButton.click();
			await expect
				.poll(() => terminalLaunchRequests)
				.toEqual([{directory: exampleDir, terminalId: 'terminal'}]);

			await projectOpenInAnotherApp.click();
			await expect(
				iTermButton.locator('img[data-terminal-icon="iterm2"]'),
			).toBeVisible();
			await iTermButton.click();
			await expect
				.poll(() => terminalLaunchRequests)
				.toEqual([
					{directory: exampleDir, terminalId: 'terminal'},
					{directory: exampleDir, terminalId: 'iterm2'},
				]);

			await projectOpenInAnotherApp.click();
			await expect(
				windowsTerminalButton.locator(
					'img[data-terminal-icon="windows-terminal"]',
				),
			).toBeVisible();
			await windowsTerminalButton.click();
			await expect
				.poll(() => terminalLaunchRequests)
				.toEqual([
					{directory: exampleDir, terminalId: 'terminal'},
					{directory: exampleDir, terminalId: 'iterm2'},
					{directory: exampleDir, terminalId: 'windows-terminal'},
				]);

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
			const cursorAgentButton = page.getByRole('button', {
				name: 'Open in Cursor Agent',
				exact: true,
			});
			await expect(
				page.getByRole('button', {name: 'Open component docs', exact: true}),
			).toHaveCount(0);
			await cursorAgentButton.click();
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
			const cursorAgentIcon = page.locator(
				'img[data-coding-agent-icon="cursor"]',
			);
			await expect(cursorAgentIcon).toHaveAttribute(
				'src',
				'/api/app-icon/coding-agent/cursor.png',
			);
			await expect
				.poll(() =>
					cursorAgentIcon.evaluate(
						(image) => (image as HTMLImageElement).naturalWidth,
					),
				)
				.toBe(64);
			const finderIcon = page.locator('img[data-file-manager-icon="finder"]');
			await expect(finderIcon).toHaveAttribute(
				'src',
				'/api/app-icon/file-manager/finder.png',
			);
			await expect
				.poll(() =>
					finderIcon.evaluate(
						(image) => (image as HTMLImageElement).naturalWidth,
					),
				)
				.toBe(36);
			await expect(
				page.getByRole('button', {name: 'Terminal', exact: true}),
			).toHaveCount(0);
			await expect(page.getByText('Editor', {exact: true})).toBeVisible();
			await expect(page.getByText('Agent', {exact: true})).toBeVisible();
			await expect(page.getByText('Editors', {exact: true})).toHaveCount(0);
			await expect(page.getByText('Agents', {exact: true})).toHaveCount(0);
			await expect(
				page.getByRole('button', {name: 'Cursor', exact: true}),
			).toHaveCount(2);
			const gitHubButton = page.getByRole('button', {
				name: 'GitHub.com',
				exact: true,
			});
			await expect(gitHubButton).toBeVisible();
			await expect(gitHubButton.locator('[data-github-icon]')).toBeVisible();
			await page.evaluate(() => {
				document.body.dataset.openedUrl = '';
				window.open = (url) => {
					document.body.dataset.openedUrl = String(url);
					return null;
				};
			});
			await gitHubButton.click();
			await expect
				.poll(() => page.evaluate(() => document.body.dataset.openedUrl ?? ''))
				.toMatch(
					/^https:\/\/github\.com\/remotion-dev\/remotion\/blob\/.+\/packages\/example\/src\/BarChart\.tsx#L\d+$/,
				);

			await timelineGridline.click({button: 'right'});
			await page.getByRole('button', {name: 'Open in...', exact: true}).click();
			await page
				.getByRole('button', {name: 'Change default apps...', exact: true})
				.click();

			const settings = page.getByRole('dialog');
			await expect(
				settings.getByTitle('Default editor', {exact: true}),
			).toBeVisible();
			await expect(
				settings.getByText('Default codec', {exact: true}),
			).toHaveCount(0);
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
								name: 'Codex',
								nameWithType: 'Codex',
							},
							{
								id: 'copilot',
								name: 'GitHub Copilot',
								nameWithType: 'GitHub Copilot',
							},
						],
						installedTerminals: [],
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
		const changeDefaultApps = page.getByRole('button', {
			name: 'Change default apps...',
		});

		await openInAnotherApp.click();
		await expect(changeDefaultApps).toBeVisible();
		// The menu overlay intercepts pointerleave; clicking it closes the menu
		// through the same outside-click path a user would take.
		await page.mouse.click(10, 100);
		await expect(changeDefaultApps).toBeHidden();
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

	test('should preview and place Canvas drops at the playhead', async ({
		page,
	}) => {
		test.setTimeout(90_000);
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		await expect(
			page.getByRole('button', {name: '0', exact: true}),
		).toBeVisible({timeout: 15_000});

		const dragData = StudioProtocolInternals.makeDragData({
			type: 'element',
			dependencies: [],
			dimensions: {width: 320, height: 120},
			displayName: 'Drop Preview',
			durationInFrames: 30,
			slug: 'drop-preview',
			sourceCode: 'export const DropPreview = () => null;',
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

		const preview = page.getByTestId('composition-drop-preview');
		await expect(preview).toBeVisible();
		const canvasBox = await canvas.boundingBox();
		const previewBox = await preview.boundingBox();
		if (canvasBox === null || previewBox === null) {
			throw new Error('Expected the Canvas and Element preview to have boxes');
		}

		expect(previewBox.width / previewBox.height).toBeCloseTo(320 / 120, 2);
		expect(
			Math.abs(
				previewBox.x +
					previewBox.width / 2 -
					(canvasBox.x + canvasBox.width / 2),
			),
		).toBeLessThan(1);
		expect(
			Math.abs(
				previewBox.y +
					previewBox.height / 2 -
					(canvasBox.y + canvasBox.height / 2),
			),
		).toBeLessThan(1);

		await page.evaluate(() => {
			document.dispatchEvent(new DragEvent('dragend', {bubbles: true}));
		});
		await expect(preview).toBeHidden();

		if (!(await page.getByRole('button', {name: 'Inspector'}).isVisible())) {
			await page.locator('[data-sidebar-toggle="right"]').click();
		}

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
		await expect(
			page.getByRole('group', {name: 'Inspector source location'}).first(),
		).toContainText('<Video>', {timeout: 15_000});
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
