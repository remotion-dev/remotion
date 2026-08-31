import fs from 'fs';
import path from 'path';
import {expect, test, type Locator, type Page} from '@playwright/test';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {
	STUDIO_URL,
	effectKeyframeE2eFile,
	exampleDir,
	lostNodePathE2eFile,
} from './constants.mts';
import {
	navigateToLostNodePathE2e,
	navigateToSchemaTest,
	retryCanvasInteractionUntilOutlineIsVisible,
} from './helpers.mts';
import {startStudio, stopStudio} from './studio-server.mts';

const macCursorsFile = path.join(exampleDir, 'src', 'MacCursors', 'index.tsx');
const sequenceShiftFile = path.join(
	exampleDir,
	'src',
	'VisualModeTests',
	'SequenceShiftRepro.tsx',
);
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

const dropFile = async ({
	base64,
	fileName,
	mimeType,
	target,
}: {
	base64: string;
	fileName: string;
	mimeType: string;
	target: Locator;
}) => {
	return target.evaluate(
		(element, file) => {
			const bytes = Uint8Array.from(atob(file.base64), (character) =>
				character.charCodeAt(0),
			);
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(
				new File([bytes], file.fileName, {type: file.mimeType}),
			);
			const dragOver = new DragEvent('dragover', {
				bubbles: true,
				cancelable: true,
				dataTransfer,
			});
			element.dispatchEvent(dragOver);
			element.dispatchEvent(
				new DragEvent('drop', {
					bubbles: true,
					cancelable: true,
					dataTransfer,
				}),
			);

			return dragOver.defaultPrevented;
		},
		{base64, fileName, mimeType},
	);
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

	test('should preview media assets as a non-interactive timeline', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/assets/prores.mov`);

		await expect(page.getByTestId('asset-media-preview')).toBeVisible({
			timeout: 15_000,
		});
		const checkerboardToggle = page.getByRole('button', {
			name: /Show transparency as checkerboard/,
		});
		await expect(checkerboardToggle).toBeVisible();
		const checkerboardWasPressed =
			(await checkerboardToggle.getAttribute('aria-pressed')) === 'true';
		await checkerboardToggle.click();
		await expect(checkerboardToggle).toHaveAttribute(
			'aria-pressed',
			String(!checkerboardWasPressed),
		);
		await checkerboardToggle.click();

		const rulersToggle = page.getByRole('button', {
			name: /^(Show|Hide) rulers$/,
		});
		const rulersWerePressed =
			(await rulersToggle.getAttribute('aria-pressed')) === 'true';
		await rulersToggle.click();
		await expect(rulersToggle).toHaveAttribute(
			'aria-pressed',
			String(!rulersWerePressed),
		);
		if (rulersWerePressed) {
			await rulersToggle.click();
		}
		const horizontalRuler = page.getByLabel('Horizontal ruler', {exact: true});
		await expect(horizontalRuler).toBeVisible();
		await expect(horizontalRuler).toHaveAttribute('aria-readonly', 'true');
		await expect(
			page.getByLabel('Vertical ruler', {exact: true}),
		).toBeVisible();
		if (!rulersWerePressed) {
			await page
				.getByRole('button', {name: 'Hide rulers', exact: true})
				.click();
		}

		const timeline = page.locator('[data-timeline-scrollable]');
		await expect(timeline).toBeVisible();
		const mediaTrack = page.getByTitle('prores.mov').last();
		await expect(mediaTrack).toBeVisible();
		await expect(timeline.locator('canvas').first()).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Play', exact: true}),
		).toBeEnabled();
		await expect(
			page.getByText(/Failed to execute getVideoMetadata/),
		).toHaveCount(0);

		await mediaTrack.dblclick();
		await expect(page.getByRole('textbox')).toHaveCount(0);

		await page.goto(`${STUDIO_URL}/assets/whip.mp3`);
		await expect(
			page.getByRole('img', {name: 'Audio asset', exact: true}),
		).toBeVisible();
		await expect(page.getByTestId('asset-media-preview')).not.toBeInViewport();
		await expect(page.locator('[data-timeline-scrollable]')).toBeVisible();
		await expect(page.getByTitle('whip.mp3').last()).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Play', exact: true}),
		).toBeEnabled();
		await expect(checkerboardToggle).toHaveCount(0);
		await expect(rulersToggle).toHaveCount(0);
		await expect(horizontalRuler).toHaveCount(0);
		await expect(
			page.locator('.remotion-studio-composition-container'),
		).toHaveCSS('background-image', 'none');
		await expect(
			page.locator('.remotion-studio-composition-container'),
		).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

		await page.goto(`${STUDIO_URL}/assets/blush-2x.mp4`);
		await expect(page.getByTestId('asset-media-preview')).toBeVisible();
		const squarePreview = page.locator(
			'.remotion-studio-composition-container',
		);
		await expect(squarePreview).toBeVisible();
		await expect
			.poll(async () => {
				const outerBox = await squarePreview.boundingBox();
				const mediaBox = await page
					.getByTestId('asset-media-preview')
					.boundingBox();
				if (outerBox === null || mediaBox === null) {
					return null;
				}

				return Math.max(
					Math.abs(outerBox.x - mediaBox.x),
					Math.abs(outerBox.y - mediaBox.y),
					Math.abs(outerBox.width - outerBox.height),
					Math.abs(outerBox.width - mediaBox.width),
					Math.abs(outerBox.height - mediaBox.height),
				);
			})
			.toBeLessThan(1);
	});

	test('should route Canvas Capture drops by Studio target', async ({page}) => {
		test.setTimeout(90_000);
		const canvasCapture = fs.readFileSync(
			path.join(
				exampleDir,
				'../brand/public/remotion-capture-editor-starter.mp4',
			),
		);
		const publicFileName = 'canvas-capture-drop-e2e.mp4';
		const publicAsset = path.join(exampleDir, 'public', publicFileName);
		fs.rmSync(publicAsset, {force: true});
		const file = {
			base64: canvasCapture.toString('base64'),
			fileName: publicFileName,
			mimeType: 'video/mp4',
		};
		const modalTitle = page.getByText('Import Canvas Capture', {exact: true});

		try {
			await page.goto(`${STUDIO_URL}/does-not-exist`);
			const missingComposition = page.getByText(
				'Composition with ID does-not-exist not found.',
			);
			await expect(missingComposition).toBeVisible();
			expect(await dropFile({...file, target: missingComposition})).toBe(true);
			await expect(modalTitle).toBeVisible();
			await expect(page.getByTitle('Folder')).toHaveText('None');
			await page.keyboard.press('Escape');

			await page.getByText('Assets', {exact: true}).click();
			const assetSelector = page.locator('[data-asset-selector]');
			await expect(assetSelector).toBeVisible();
			expect(await dropFile({...file, target: assetSelector})).toBe(true);
			await expect
				.poll(
					() =>
						fs.existsSync(publicAsset) &&
						fs.readFileSync(publicAsset).equals(canvasCapture),
				)
				.toBe(true);
			await expect(page.getByText(publicFileName, {exact: true})).toBeVisible();
			await expect(modalTitle).toBeHidden();

			await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
			const timeline = page.locator('[data-timeline-scrollable]');
			await expect(timeline).toBeVisible();
			const timelineBox = await timeline.boundingBox();
			if (timelineBox === null) {
				throw new Error('Expected timeline to have a bounding box');
			}

			const dragData = StudioProtocolInternals.makeDragData({
				type: 'asset',
				assetPath: 'quick.mov',
				durationInSeconds: 5.866667,
				height: null,
				width: null,
			});
			const dragAssetOver = (target: Locator) => {
				return target.evaluate(
					(element, {coordinates, data}) => {
						const dataTransfer = new DataTransfer();
						dataTransfer.setData(data.mimeType, data.payload);
						element.dispatchEvent(
							new DragEvent('dragover', {
								bubbles: true,
								cancelable: true,
								clientX: coordinates.clientX,
								clientY: coordinates.clientY,
								dataTransfer,
							}),
						);
					},
					{
						coordinates: {
							clientX: timelineBox.x + timelineBox.width / 2,
							clientY: timelineBox.y + timelineBox.height / 2,
						},
						data: dragData,
					},
				);
			};
			const dropIndicator = page.locator(
				'[data-timeline-asset-drop-indicator]',
			);
			await dragAssetOver(timeline);
			await expect(dropIndicator).toBeVisible();
			await page.evaluate(() => {
				document.dispatchEvent(new DragEvent('dragend', {bubbles: true}));
			});
			await expect(dropIndicator).toBeHidden();

			await page.getByRole('button', {name: /Search\.\.\./}).click();
			const quickSwitcher = page.getByRole('dialog');
			await quickSwitcher.getByRole('textbox').fill('> Settings');
			await quickSwitcher.getByText('Settings...', {exact: true}).click();
			const settings = page.getByRole('dialog');
			await expect(
				settings.getByText('Default codec', {exact: true}),
			).toBeVisible();
			await dragAssetOver(settings);
			await expect(dropIndicator).toBeHidden();
			await expect(
				settings.getByText('Default codec', {exact: true}),
			).toBeVisible();
			await page.keyboard.press('Escape');

			expect(await dropFile({...file, target: timeline})).toBe(true);
			await expect(modalTitle).toBeVisible();
		} finally {
			fs.rmSync(publicAsset, {force: true});
		}
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
		await retryCanvasInteractionUntilOutlineIsVisible({
			interaction: () => canvas.hover(),
			outline: visibleOutlines,
			page,
		});
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

	test('should show negative sequence timing in the frame-zero gutter', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/timeline-negative-start`);
		await expect(page).toHaveURL(/timeline-negative-start/, {
			timeout: 15_000,
		});

		const timelineScrollable = page.locator('[data-timeline-scrollable]');
		const negativeSequence = page.locator(
			'[data-timeline-marquee-item][title="Negative start"]',
		);
		const zeroSequence = page.locator(
			'[data-timeline-marquee-item][title="Zero start"]',
		);
		await expect(negativeSequence).toBeVisible();
		await expect(zeroSequence).toBeVisible();

		const [timelineRect, negativeSequenceRect, zeroSequenceRect] =
			await Promise.all([
				timelineScrollable.boundingBox(),
				negativeSequence.boundingBox(),
				zeroSequence.boundingBox(),
			]);
		expect(timelineRect).not.toBeNull();
		expect(negativeSequenceRect).not.toBeNull();
		expect(zeroSequenceRect).not.toBeNull();
		expect(negativeSequenceRect!.x).toBeGreaterThanOrEqual(timelineRect!.x);
		expect(negativeSequenceRect!.x).toBeLessThan(zeroSequenceRect!.x);
		expect(zeroSequenceRect!.x - negativeSequenceRect!.x).toBeLessThanOrEqual(
			16,
		);
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

	test('should keep Effects expanded and preserve the inspector scroll position when adding an effect', async ({
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
		await expect(page.getByText('wave()', {exact: true})).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Collapse Effects', exact: true}),
		).toHaveCount(0);
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
		const canvasItemOutline = page.locator(
			'polygon[data-remotion-prevent-selection-clear="true"][stroke-opacity="1"]',
		);
		await retryCanvasInteractionUntilOutlineIsVisible({
			interaction: () => canvasItem.hover(),
			outline: canvasItemOutline,
			page,
		});
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

	test('should keep selected editing handles above overlapping outlines', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/outline-selection-cases`);
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);
		await page.keyboard.press('g');
		const currentFrameInput = page.locator('input:focus');
		await expect(currentFrameInput).toBeVisible();
		await currentFrameInput.fill('2160');
		await currentFrameInput.press('Enter');

		const target = page.locator(
			'[data-timeline-marquee-item="true"][title="Editable transform target"]',
		);
		await expect(target).toBeVisible();
		await target.click();

		const rightScaleEdge = page.locator(
			'[data-remotion-studio-scale-edge="right"][data-remotion-studio-scale-edge-contains-selection="true"]',
		);
		await expect(rightScaleEdge).toBeVisible();
		const scaleEdgePoint = await rightScaleEdge.evaluate((element) => {
			if (!(element instanceof SVGLineElement)) {
				throw new Error('Scale edge should be an SVG line');
			}

			const matrix = element.getScreenCTM();
			if (matrix === null) {
				throw new Error('Scale edge should have a screen transform');
			}

			const first = new DOMPoint(
				element.x1.baseVal.value,
				element.y1.baseVal.value,
			).matrixTransform(matrix);
			const second = new DOMPoint(
				element.x2.baseVal.value,
				element.y2.baseVal.value,
			).matrixTransform(matrix);
			const [top, bottom] =
				first.y < second.y ? [first, second] : [second, first];

			return {
				x: top.x + (bottom.x - top.x) * 0.2,
				y: top.y + (bottom.y - top.y) * 0.2,
			};
		});
		expect(
			await page.evaluate(
				({x, y}) =>
					document
						.elementFromPoint(x, y)
						?.getAttribute('data-remotion-studio-scale-edge') ?? null,
				scaleEdgePoint,
			),
		).toBe('right');

		const topRightRotationCorner = page.locator(
			'[data-remotion-studio-rotation-corner="top-right"][data-remotion-studio-rotation-corner-contains-selection="true"]',
		);
		await expect(topRightRotationCorner).toBeVisible();
		const rotationCornerBox = await topRightRotationCorner.boundingBox();
		if (rotationCornerBox === null) {
			throw new Error('Rotation corner should have a visible layout');
		}

		expect(
			await page.evaluate(
				({x, y}) =>
					document
						.elementFromPoint(x, y)
						?.getAttribute('data-remotion-studio-rotation-corner') ?? null,
				{
					x: rotationCornerBox.x + rotationCornerBox.width / 2,
					y: rotationCornerBox.y + rotationCornerBox.height / 2,
				},
			),
		).toBe('top-right');

		await topRightRotationCorner.click({button: 'right'});
		await expect(
			page.getByRole('button', {name: 'Duplicate', exact: true}),
		).toBeVisible();
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
		const firstCompositionItems = await page
			.locator('.__remotion-composition-selector-item')
			.evaluateAll((items) =>
				items.slice(0, 3).map((item) => item.getAttribute('title')),
			);
		expect(firstCompositionItems).toEqual([
			'use-current-scale-on-load',
			'Schema',
			'AnimatedBarChart',
		]);
		const registeredCompositionItems = await page
			.locator('.__remotion-composition-selector-item[data-compname]')
			.evaluateAll((items) =>
				items.map((item) => item.getAttribute('data-compname') ?? ''),
			);
		const alphabeticalCompositionItems = [...registeredCompositionItems].sort(
			(a, b) => a.localeCompare(b, undefined, {numeric: true}),
		);
		await page.getByRole('button', {name: 'More composition actions'}).click();
		await expect(
			page.getByRole('button', {name: 'New composition...', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'New folder...', exact: true}),
		).toBeVisible();
		await expect(page.getByText('Sort', {exact: true})).toBeVisible();
		await page
			.getByRole('button', {name: 'Alphabetically', exact: true})
			.click();
		await expect
			.poll(() =>
				page
					.locator('.__remotion-composition-selector-item[data-compname]')
					.evaluateAll((items) =>
						items.map((item) => item.getAttribute('data-compname') ?? ''),
					),
			)
			.toEqual(alphabeticalCompositionItems);
		await page.reload();
		await expect(page.getByRole('button', {name: 'Schema'})).toBeVisible({
			timeout: 15_000,
		});
		await expect
			.poll(() =>
				page
					.locator('.__remotion-composition-selector-item[data-compname]')
					.evaluateAll((items) =>
						items.map((item) => item.getAttribute('data-compname') ?? ''),
					),
			)
			.toEqual(alphabeticalCompositionItems);
		await page.getByRole('button', {name: 'More composition actions'}).click();
		await page
			.getByRole('button', {name: 'New composition...', exact: true})
			.click();
		await page.getByTitle('Folder').click();
		const rootFolderNames = [
			'Schema',
			'visual-controls',
			'lost-node-path',
			'error-overlay',
			'hook-order-change',
		];
		const getVisibleRootFolderOrder = () =>
			page
				.locator('[data-remotion-menu-tree-id]')
				.last()
				.getByRole('button')
				.allTextContents()
				.then((items) =>
					items
						.map((item) => item.trim())
						.filter((item) => rootFolderNames.includes(item)),
				);
		await expect
			.poll(getVisibleRootFolderOrder)
			.toEqual([
				'error-overlay',
				'hook-order-change',
				'lost-node-path',
				'Schema',
				'visual-controls',
			]);
		await page.keyboard.press('Escape');
		await page.keyboard.press('Escape');

		await page.getByRole('button', {name: 'More composition actions'}).click();
		await page
			.getByRole('button', {name: 'As registered', exact: true})
			.click();
		await expect
			.poll(() =>
				page
					.locator('.__remotion-composition-selector-item')
					.evaluateAll((items) =>
						items.slice(0, 3).map((item) => item.getAttribute('title')),
					),
			)
			.toEqual(firstCompositionItems);

		await page.getByRole('button', {name: 'More composition actions'}).click();
		await page
			.getByRole('button', {name: 'New composition...', exact: true})
			.click();
		await expect(page.getByPlaceholder('Composition ID')).toBeVisible();
		await page.getByTitle('Folder').click();
		await expect.poll(getVisibleRootFolderOrder).toEqual(rootFolderNames);
		await page.keyboard.press('Escape');
		await page.keyboard.press('Escape');
		await page.getByRole('button', {name: 'More composition actions'}).click();
		await page
			.getByRole('button', {name: 'New folder...', exact: true})
			.click();
		await expect(page.getByPlaceholder('Folder name')).toBeVisible();
		await page.keyboard.press('Escape');

		const uploadedFileName = 'explorer-header-upload-e2e.txt';
		const uploadedFileContents = 'Uploaded from the explorer header';
		const uploadedFilePath = path.join(exampleDir, 'public', uploadedFileName);
		fs.rmSync(uploadedFilePath, {force: true});
		try {
			await page.getByRole('button', {name: 'Assets', exact: true}).click();
			await page.getByRole('button', {name: 'More asset actions'}).click();
			const fileChooserPromise = page.waitForEvent('filechooser');
			await page.getByRole('button', {name: 'Upload...', exact: true}).click();
			const fileChooser = await fileChooserPromise;
			await fileChooser.setFiles({
				name: uploadedFileName,
				mimeType: 'text/plain',
				buffer: Buffer.from(uploadedFileContents),
			});
			await expect(
				page.getByText(`Uploaded ${uploadedFileName} to public folder`, {
					exact: true,
				}),
			).toBeVisible();
			await expect
				.poll(() =>
					fs.existsSync(uploadedFilePath)
						? fs.readFileSync(uploadedFilePath, 'utf8')
						: null,
				)
				.toBe(uploadedFileContents);
			await expect(
				page.getByText(uploadedFileName, {exact: true}),
			).toBeVisible();
		} finally {
			fs.rmSync(uploadedFilePath, {force: true});
		}

		await page.getByRole('button', {name: 'Compositions', exact: true}).click();

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
		const rootFile = path.join(exampleDir, 'src', 'E2eTestRoot.tsx');
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
			await page.getByTitle('Folder').click();
			const schemaFolderOption = page
				.getByRole('button', {name: 'Schema', exact: true})
				.last();
			const schemaFolderLabel = schemaFolderOption.getByText('Schema', {
				exact: true,
			});
			await expect(schemaFolderLabel).toHaveCSS('font-size', '13px');
			await schemaFolderOption.hover();
			await expect(schemaFolderLabel).toHaveCSS('font-size', '13px');
			await schemaFolderOption.click();
			await expect(page.getByTitle('Folder')).toHaveText('Schema');

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
			const rootContents = fs.readFileSync(rootFile, 'utf8');
			const folderStart = rootContents.indexOf('<Folder name="Schema">');
			const folderEnd = rootContents.indexOf('</Folder>', folderStart);
			if (folderStart === -1 || folderEnd === -1) {
				throw new Error('Could not find the Schema folder in the root file');
			}

			const compositionPosition = rootContents.indexOf(`id="${compositionId}"`);
			expect(compositionPosition).toBeGreaterThan(folderStart);
			expect(compositionPosition).toBeLessThan(folderEnd);
		} finally {
			const undoButton = page.getByRole('button', {name: /^Undo/});
			if ((await undoButton.count()) > 0 && (await undoButton.isEnabled())) {
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
			await dialog
				.getByRole('button', {name: 'Shortcuts', exact: true})
				.click();
			await expect(
				dialog.getByText('Keyboard shortcuts', {exact: true}),
			).toBeVisible();
			await expect(
				dialog.getByRole('list', {name: 'Playback', exact: true}),
			).toBeVisible();
			await dialog.getByRole('button', {name: 'Studio', exact: true}).click();

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
			const freeLicenseToggle = dialog.getByRole('radio', {
				name: 'I am eligible for the Free License',
			});
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

	test('should apply a timeline context menu action to multiple selected sequences', async ({
		page,
	}) => {
		const sourceBefore = fs.readFileSync(sequenceShiftFile, 'utf-8');

		try {
			await page.goto(`${STUDIO_URL}/sequence-shift-repro`);
			await page.waitForFunction(
				() => !document.body.innerText.includes('Loading...'),
				{timeout: 30_000},
			);
			await page.keyboard.press('g');
			const currentFrameInput = page.locator('input:focus');
			await currentFrameInput.fill('22');
			await currentFrameInput.press('Enter');
			const outer = page.getByText('Outer frame descendant', {exact: true});
			const local = page.getByText('Local frame descendant', {exact: true});
			const localBar = page.locator(
				'[data-timeline-marquee-item][title="Local frame descendant"]',
			);
			await expect(outer).toBeVisible({timeout: 15_000});
			await expect(local).toBeVisible();

			await outer.click();
			await local.click({modifiers: ['Meta']});
			await localBar.click({button: 'right'});
			await expect(outer.locator('../../..')).toHaveCSS(
				'background-color',
				'rgb(59, 63, 66)',
			);
			await expect(
				page
					.locator('[data-remotion-menu-tree-id]')
					.last()
					.getByRole('button', {
						name: 'Duplicate selected',
						exact: true,
					}),
			).toBeVisible();
			await page.keyboard.press('Escape');
			await local.click({button: 'right'});
			await expect(outer.locator('../../..')).toHaveCSS(
				'background-color',
				'rgb(59, 63, 66)',
			);

			const contextMenu = page.locator('[data-remotion-menu-tree-id]').last();
			await expect(
				contextMenu.getByRole('button', {
					name: 'Duplicate selected',
					exact: true,
				}),
			).toBeVisible();
			await contextMenu
				.getByRole('button', {name: 'Delete selected', exact: true})
				.click();

			await expect
				.poll(() => {
					const source = fs.readFileSync(sequenceShiftFile, 'utf-8');
					return [
						source.includes('name="Outer frame descendant"'),
						source.includes('name="Local frame descendant"'),
					];
				})
				.toEqual([false, false]);
		} finally {
			fs.writeFileSync(sequenceShiftFile, sourceBefore);
		}
	});

	test('should duplicate each selected timeline sequence once', async ({
		page,
	}) => {
		const sourceBefore = fs.readFileSync(sequenceShiftFile, 'utf-8');

		try {
			await page.goto(`${STUDIO_URL}/sequence-shift-repro`);
			await page.waitForFunction(
				() => !document.body.innerText.includes('Loading...'),
				{timeout: 30_000},
			);
			await page.keyboard.press('g');
			const currentFrameInput = page.locator('input:focus');
			await currentFrameInput.fill('22');
			await currentFrameInput.press('Enter');
			const outer = page.getByText('Outer frame descendant', {exact: true});
			const nestedParent = page.getByText('Nested timing parent', {
				exact: true,
			});
			await expect(outer).toBeVisible({timeout: 15_000});
			await expect(nestedParent).toBeVisible();

			await outer.click();
			await nestedParent.click({modifiers: ['Meta']});
			await nestedParent.click({button: 'right'});
			await page
				.locator('[data-remotion-menu-tree-id]')
				.last()
				.getByRole('button', {name: 'Duplicate selected', exact: true})
				.click();

			await expect
				.poll(() => {
					const source = fs.readFileSync(sequenceShiftFile, 'utf-8');
					return [
						source.match(/name="Outer frame descendant-copy"/g)?.length ?? 0,
						source.match(/name="Nested timing parent-copy"/g)?.length ?? 0,
						source.match(/name="Outer frame descendant-copy-copy"/g)?.length ??
							0,
						source.match(/<LocalFrameDescendant \/>/g)?.length ?? 0,
					];
				})
				.toEqual([1, 1, 0, 1]);

			await page.keyboard.press('ControlOrMeta+z');
			await expect
				.poll(() => fs.readFileSync(sequenceShiftFile, 'utf-8'))
				.toBe(sourceBefore);
		} finally {
			fs.writeFileSync(sequenceShiftFile, sourceBefore);
		}
	});

	test('should keep selected canvas outlines visible outside the canvas', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/AnimatedBarChart`);

		const firstGridline = page.getByText('0% gridline', {exact: true});
		await expect(firstGridline).toBeVisible({timeout: 15_000});

		const canvas = page.locator('.remotion-studio-composition-container');
		const visibleOutlines = canvas.locator(
			'> svg[aria-hidden="true"] polygon[stroke="#0b84f3"][stroke-opacity="1"]',
		);
		await retryCanvasInteractionUntilOutlineIsVisible({
			interaction: () => canvas.hover(),
			outline: visibleOutlines,
			page,
		});
		await visibleOutlines.first().click({force: true});
		await page.mouse.move(0, 0);
		await expect(visibleOutlines.first()).toBeVisible();
	});

	test('should clear selection after context-menu deletion and preserve following interactive elements', async ({
		context,
		page,
	}) => {
		await context.addInitScript(() => {
			type RegisteredTool = {
				readonly name: string;
				readonly execute: (input: Record<string, unknown>) => Promise<unknown>;
			};
			const tools = new Map<string, RegisteredTool>();
			Object.defineProperty(window, '__remotion_webmcp_tools', {
				value: tools,
			});
			Object.defineProperty(document, 'modelContext', {
				value: {
					registerTool: async (
						tool: RegisteredTool,
						options: {readonly signal: AbortSignal},
					) => {
						tools.set(tool.name, tool);
						options.signal.addEventListener('abort', () => {
							if (tools.get(tool.name) === tool) {
								tools.delete(tool.name);
							}
						});
					},
				},
			});
		});
		await navigateToLostNodePathE2e(page);
		const getWebMcpSelection = () =>
			page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools?: Map<
							string,
							{readonly execute: () => Promise<unknown>}
						>;
					}
				).__remotion_webmcp_tools;
				if (!tools) {
					return null;
				}

				const tool = tools.get('get_selection');
				if (!tool) {
					return null;
				}

				return tool.execute();
			});
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
		await eyebrow.click({button: 'right'});
		await expect.poll(getWebMcpSelection).toEqual(
			expect.objectContaining({
				selectionType: 'sequence',
				selectedSequence: expect.objectContaining({name: 'Eyebrow'}),
			}),
		);
		await page.getByRole('button', {name: 'Delete', exact: true}).click();

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
		await expect.poll(getWebMcpSelection).toEqual(
			expect.objectContaining({
				currentSelection: null,
				selectionType: null,
				selectedSequence: null,
			}),
		);

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
		await page.addInitScript(() => {
			window.localStorage.setItem('remotion.mute', 'false');
			window.localStorage.setItem('remotion.loop', 'true');
			window.localStorage.setItem('remotion.editorShowGuides', 'true');
			window.localStorage.setItem(
				'remotion.guidesList',
				JSON.stringify([
					{
						id: 'webmcp-vertical-guide',
						orientation: 'vertical',
						position: 320,
						show: true,
						compositionId: 'AnimatedBarChart',
					},
					{
						id: 'webmcp-horizontal-guide',
						orientation: 'horizontal',
						position: 180,
						show: true,
						compositionId: 'AnimatedBarChart',
					},
					{
						id: 'other-composition-guide',
						orientation: 'vertical',
						position: 100,
						show: true,
						compositionId: 'Shapes',
					},
				]),
			);
			type RegisteredTool = {
				readonly name: string;
				readonly execute: (input: Record<string, unknown>) => Promise<unknown>;
			};
			const tools = new Map<string, RegisteredTool>();
			Object.defineProperty(window, '__remotion_webmcp_tools', {
				value: tools,
			});
			Object.defineProperty(document, 'modelContext', {
				value: {
					registerTool: async (
						tool: RegisteredTool,
						options: {readonly signal: AbortSignal},
					) => {
						tools.set(tool.name, tool);
						options.signal.addEventListener('abort', () => {
							if (tools.get(tool.name) === tool) {
								tools.delete(tool.name);
							}
						});
					},
				},
			});
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
			await page.getByRole('button', {name: 'Jump to beginning'}).click();
			for (let i = 0; i < 3; i++) {
				await page
					.getByRole('button', {name: 'Step forward one frame'})
					.click();
			}
			await expect
				.poll(() =>
					page.evaluate(() => {
						const tools = (
							window as typeof window & {
								readonly __remotion_webmcp_tools: Map<string, unknown>;
							}
						).__remotion_webmcp_tools;
						return (
							tools.has('get_compositions') &&
							tools.has('select_composition') &&
							tools.has('get_sequences') &&
							tools.has('select_sequence') &&
							tools.has('get_composition') &&
							tools.has('get_canvas_html') &&
							tools.has('get_outlines') &&
							tools.has('get_playback_state') &&
							tools.has('get_selection') &&
							tools.has('get_guides') &&
							tools.has('set_guides_visible') &&
							tools.has('add_guide') &&
							tools.has('remove_guide') &&
							tools.has('play') &&
							tools.has('pause') &&
							tools.has('mute') &&
							tools.has('unmute') &&
							tools.has('set_timeline_zoom') &&
							tools.has('set_playback_rate') &&
							tools.has('seek_to_frame')
						);
					}),
				)
				.toBe(true);
			const webMcpSelection = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{readonly execute: () => Promise<unknown>}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('get_selection');
				if (!tool) {
					throw new Error('get_selection was not registered');
				}

				return tool.execute();
			});
			expect(webMcpSelection).toEqual({
				currentFrame: 3,
				currentSelection: contextForAgents,
				currentComposition: 'AnimatedBarChart',
				selectionType: 'sequence',
				selectedSequence: expect.objectContaining({
					sequenceId: expect.any(String),
					name: '0% gridline',
					type: 'sequence',
					stack: expect.any(String),
					selectable: true,
				}),
			});
			const selectedSequence = (
				webMcpSelection as {
					readonly selectedSequence: {
						readonly sequenceId: string;
						readonly parentSequenceId: string | null;
					};
				}
			).selectedSequence;
			const webMcpSequences = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{readonly execute: () => Promise<unknown>}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('get_sequences');
				if (!tool) {
					throw new Error('get_sequences was not registered');
				}

				return tool.execute();
			});
			const sequenceList = (
				webMcpSequences as {
					readonly sequences: readonly {
						readonly sequenceId: string;
						readonly selectable: boolean;
					}[];
				}
			).sequences;
			expect(webMcpSequences).toEqual({
				currentComposition: 'AnimatedBarChart',
				sequences: expect.arrayContaining([
					expect.objectContaining({
						sequenceId: selectedSequence.sequenceId,
						name: '0% gridline',
						selectable: true,
					}),
				]),
			});
			const sequenceToSelect = sequenceList.find(
				(sequence) =>
					sequence.selectable &&
					sequence.sequenceId !== selectedSequence.sequenceId,
			);
			expect(sequenceToSelect).toBeDefined();
			const webMcpSelectSequenceResult = await page.evaluate(
				async ({sequenceId}) => {
					const tools = (
						window as typeof window & {
							readonly __remotion_webmcp_tools: Map<
								string,
								{
									readonly execute: (
										input: Record<string, unknown>,
									) => Promise<unknown>;
								}
							>;
						}
					).__remotion_webmcp_tools;
					const tool = tools.get('select_sequence');
					if (!tool) {
						throw new Error('select_sequence was not registered');
					}

					return tool.execute({sequenceId});
				},
				{sequenceId: sequenceToSelect?.sequenceId ?? ''},
			);
			expect(webMcpSelectSequenceResult).toEqual({
				currentComposition: 'AnimatedBarChart',
				selectedSequence: expect.objectContaining({
					sequenceId: sequenceToSelect?.sequenceId,
					selectable: true,
				}),
			});
			await expect
				.poll(() =>
					page.evaluate(async () => {
						const tools = (
							window as typeof window & {
								readonly __remotion_webmcp_tools: Map<
									string,
									{readonly execute: () => Promise<unknown>}
								>;
							}
						).__remotion_webmcp_tools;
						const tool = tools.get('get_selection');
						const selection = (await tool?.execute()) as {
							readonly selectionType?: string;
							readonly selectedSequence?: {
								readonly sequenceId?: string;
							};
						};
						return {
							selectionType: selection.selectionType,
							sequenceId: selection.selectedSequence?.sequenceId,
						};
					}),
				)
				.toEqual({
					selectionType: 'sequence',
					sequenceId: sequenceToSelect?.sequenceId,
				});
			const webMcpComposition = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{readonly execute: () => Promise<unknown>}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('get_composition');
				if (!tool) {
					throw new Error('get_composition was not registered');
				}

				return tool.execute();
			});
			expect(webMcpComposition).toEqual({
				compositionName: 'AnimatedBarChart',
				stack: expect.any(String),
				durationInFrames: 180,
				height: 720,
				width: 1280,
				fps: 30,
				currentFrame: 3,
			});
			const webMcpCanvasHtml = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{readonly execute: () => Promise<unknown>}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('get_canvas_html');
				if (!tool) {
					throw new Error('get_canvas_html was not registered');
				}

				return tool.execute();
			});
			const canvasHtml = (
				webMcpCanvasHtml as {
					readonly html: string;
					readonly htmlLength: number;
				}
			).html;
			expect(webMcpCanvasHtml).toEqual({
				currentComposition: 'AnimatedBarChart',
				currentFrame: 3,
				html: expect.any(String),
				htmlLength: canvasHtml.length,
				truncated: false,
			});
			expect(canvasHtml).toContain('Performance overview');
			expect(canvasHtml).toContain('Regional growth');
			expect(canvasHtml).not.toContain('Change the playback rate');
			const webMcpOutlines = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{readonly execute: () => Promise<unknown>}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('get_outlines');
				if (!tool) {
					throw new Error('get_outlines was not registered');
				}

				return tool.execute();
			});
			const gridlineOutline = (
				webMcpOutlines as {
					readonly outlines: readonly {
						readonly name: string | null;
						readonly sequenceId: string;
						readonly parentSequenceId: string | null;
						readonly location: {
							readonly filename: string;
							readonly line: number;
						} | null;
						readonly geometry: {
							readonly points: readonly {
								readonly x: number;
								readonly y: number;
							}[];
							readonly boundingBox: {
								readonly x: number;
								readonly y: number;
								readonly width: number;
								readonly height: number;
							};
						};
					}[];
				}
			).outlines.find((outline) => outline.name === '0% gridline');
			expect(webMcpOutlines).toEqual({
				currentComposition: 'AnimatedBarChart',
				currentFrame: 3,
				outlines: expect.any(Array),
			});
			expect(gridlineOutline).toEqual({
				sequenceId: selectedSequence.sequenceId,
				parentSequenceId: selectedSequence.parentSequenceId,
				name: '0% gridline',
				location: {
					filename: 'src/BarChart.tsx',
					line: expect.any(Number),
				},
				geometry: {
					points: expect.arrayContaining([
						expect.objectContaining({
							x: expect.any(Number),
							y: expect.any(Number),
						}),
					]),
					boundingBox: {
						x: expect.any(Number),
						y: expect.any(Number),
						width: expect.any(Number),
						height: expect.any(Number),
					},
				},
			});
			expect(gridlineOutline?.geometry.points).toHaveLength(4);
			expect(gridlineOutline?.geometry.boundingBox.x).toBeGreaterThan(150);
			expect(gridlineOutline?.geometry.boundingBox.x).toBeLessThan(180);
			expect(gridlineOutline?.geometry.boundingBox.y).toBeGreaterThan(550);
			expect(gridlineOutline?.geometry.boundingBox.y).toBeLessThan(610);
			expect(gridlineOutline?.geometry.boundingBox.width).toBeGreaterThan(950);
			expect(gridlineOutline?.geometry.boundingBox.width).toBeLessThan(1030);
			const webMcpCompositions = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{readonly execute: () => Promise<unknown>}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('get_compositions');
				if (!tool) {
					throw new Error('get_compositions was not registered');
				}

				return tool.execute();
			});
			expect(webMcpCompositions).toEqual({
				compositions: expect.arrayContaining([
					{
						type: 'folder',
						folderName: 'visual-controls',
						children: [
							{
								type: 'composition',
								compositionName: 'visual-controls',
							},
							{
								type: 'composition',
								compositionName: 'effect-keyframe-e2e',
							},
						],
					},
					{
						type: 'composition',
						compositionName: 'AnimatedBarChart',
					},
				]),
			});
			const webMcpSelectCompositionResult = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('select_composition');
				if (!tool) {
					throw new Error('select_composition was not registered');
				}

				return tool.execute({compositionName: 'package-absolute-fill'});
			});
			expect(webMcpSelectCompositionResult).toEqual({
				currentComposition: 'package-absolute-fill',
			});
			await expect
				.poll(() => new URL(page.url()).pathname)
				.toBe('/package-absolute-fill');
			await expect
				.poll(() =>
					page.evaluate(async () => {
						const tools = (
							window as typeof window & {
								readonly __remotion_webmcp_tools: Map<
									string,
									{readonly execute: () => Promise<unknown>}
								>;
							}
						).__remotion_webmcp_tools;
						const tool = tools.get('get_composition');
						const result = (await tool?.execute()) as {
							readonly compositionName?: string;
						};
						return result?.compositionName ?? null;
					}),
				)
				.toBe('package-absolute-fill');
			await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('select_composition');
				if (!tool) {
					throw new Error('select_composition was not registered');
				}

				await tool.execute({compositionName: 'AnimatedBarChart'});
			});
			await expect
				.poll(() => new URL(page.url()).pathname)
				.toBe('/AnimatedBarChart');
			const webMcpGuides = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('get_guides');
				if (!tool) {
					throw new Error('get_guides was not registered');
				}

				return tool.execute({});
			});
			expect(webMcpGuides).toEqual({
				currentComposition: 'AnimatedBarChart',
				guidesVisible: true,
				guides: [
					{
						id: 'webmcp-vertical-guide',
						orientation: 'vertical',
						position: 320,
						visible: true,
					},
					{
						id: 'webmcp-horizontal-guide',
						orientation: 'horizontal',
						position: 180,
						visible: true,
					},
				],
			});
			await expect(page.locator('.__remotion_editor_guide')).toHaveCount(2);
			const webMcpHideGuidesResult = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('set_guides_visible');
				if (!tool) {
					throw new Error('set_guides_visible was not registered');
				}

				return tool.execute({visible: false});
			});
			expect(webMcpHideGuidesResult).toEqual({
				currentComposition: 'AnimatedBarChart',
				guidesVisible: false,
			});
			await expect(page.locator('.__remotion_editor_guide')).toHaveCount(0);
			await expect
				.poll(() =>
					page.evaluate(() =>
						localStorage.getItem('remotion.editorShowGuides'),
					),
				)
				.toBe('false');
			const webMcpShowGuidesResult = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('set_guides_visible');
				if (!tool) {
					throw new Error('set_guides_visible was not registered');
				}

				return tool.execute({visible: true});
			});
			expect(webMcpShowGuidesResult).toEqual({
				currentComposition: 'AnimatedBarChart',
				guidesVisible: true,
			});
			await expect(page.locator('.__remotion_editor_guide')).toHaveCount(2);
			await expect
				.poll(() =>
					page.evaluate(() =>
						localStorage.getItem('remotion.editorShowGuides'),
					),
				)
				.toBe('true');
			const webMcpAddGuideResult = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('add_guide');
				if (!tool) {
					throw new Error('add_guide was not registered');
				}

				return tool.execute({orientation: 'vertical', position: 640});
			});
			expect(webMcpAddGuideResult).toEqual({
				currentComposition: 'AnimatedBarChart',
				guide: {
					id: expect.any(String),
					orientation: 'vertical',
					position: 640,
					visible: true,
				},
			});
			const addedGuideId = (
				webMcpAddGuideResult as {readonly guide: {readonly id: string}}
			).guide.id;
			await expect
				.poll(() =>
					page.evaluate(
						({guideId}) => {
							const guides = JSON.parse(
								localStorage.getItem('remotion.guidesList') ?? '[]',
							) as {readonly id: string}[];
							return guides.some((guide) => guide.id === guideId);
						},
						{guideId: addedGuideId},
					),
				)
				.toBe(true);
			await expect(page.locator('.__remotion_editor_guide')).toHaveCount(3);
			const webMcpRemoveGuideResult = await page.evaluate(
				async ({guideId}) => {
					const tools = (
						window as typeof window & {
							readonly __remotion_webmcp_tools: Map<
								string,
								{
									readonly execute: (
										input: Record<string, unknown>,
									) => Promise<unknown>;
								}
							>;
						}
					).__remotion_webmcp_tools;
					const tool = tools.get('remove_guide');
					if (!tool) {
						throw new Error('remove_guide was not registered');
					}

					return tool.execute({guideId});
				},
				{guideId: addedGuideId},
			);
			expect(webMcpRemoveGuideResult).toEqual({
				currentComposition: 'AnimatedBarChart',
				guideId: addedGuideId,
				removed: true,
			});
			await expect
				.poll(() =>
					page.evaluate(
						({guideId}) => {
							const guides = JSON.parse(
								localStorage.getItem('remotion.guidesList') ?? '[]',
							) as {readonly id: string}[];
							return guides.some((guide) => guide.id === guideId);
						},
						{guideId: addedGuideId},
					),
				)
				.toBe(false);
			await expect(page.locator('.__remotion_editor_guide')).toHaveCount(2);
			const webMcpPlaybackRateResult = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('set_playback_rate');
				if (!tool) {
					throw new Error('set_playback_rate was not registered');
				}

				return tool.execute({playbackRate: 1.5});
			});
			expect(webMcpPlaybackRateResult).toEqual({
				currentComposition: 'AnimatedBarChart',
				playbackRate: 1.5,
			});
			await expect(
				page.getByRole('button', {
					name: 'Change the playback rate',
					exact: true,
				}),
			).toContainText('1.5x');
			const webMcpTimelineZoomResult = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('set_timeline_zoom');
				if (!tool) {
					throw new Error('set_timeline_zoom was not registered');
				}

				return tool.execute({zoom: 0.5});
			});
			expect(webMcpTimelineZoomResult).toEqual({
				currentComposition: 'AnimatedBarChart',
				timelineZoom: 0.489,
			});
			await expect(
				page.locator('input[type="range"][alt^="Timeline zoom"]'),
			).toHaveValue('489');
			const webMcpMuteResult = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('mute');
				if (!tool) {
					throw new Error('mute was not registered');
				}

				return tool.execute({});
			});
			expect(webMcpMuteResult).toEqual({
				currentComposition: 'AnimatedBarChart',
				muted: true,
			});
			await expect(
				page.getByRole('button', {name: 'Unmute video', exact: true}),
			).toBeVisible();
			const webMcpUnmuteResult = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('unmute');
				if (!tool) {
					throw new Error('unmute was not registered');
				}

				return tool.execute({});
			});
			expect(webMcpUnmuteResult).toEqual({
				currentComposition: 'AnimatedBarChart',
				muted: false,
			});
			await expect(
				page.getByRole('button', {name: 'Mute video', exact: true}),
			).toBeVisible();
			const webMcpPlayResult = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('play');
				if (!tool) {
					throw new Error('play was not registered');
				}

				return tool.execute({});
			});
			expect(webMcpPlayResult).toEqual({
				currentComposition: 'AnimatedBarChart',
				playing: true,
			});
			await expect(
				page.getByRole('button', {name: 'Pause', exact: true}),
			).toBeVisible();
			const webMcpPauseResult = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('pause');
				if (!tool) {
					throw new Error('pause was not registered');
				}

				return tool.execute({});
			});
			expect(webMcpPauseResult).toEqual({
				currentComposition: 'AnimatedBarChart',
				playing: false,
			});
			await expect(
				page.getByRole('button', {name: 'Play', exact: true}),
			).toBeVisible();
			const webMcpSeekResult = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{
								readonly execute: (
									input: Record<string, unknown>,
								) => Promise<unknown>;
							}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('seek_to_frame');
				if (!tool) {
					throw new Error('seek_to_frame was not registered');
				}

				return tool.execute({frame: 200});
			});
			expect(webMcpSeekResult).toEqual({
				currentFrame: 179,
				currentComposition: 'AnimatedBarChart',
			});
			await expect(
				page.getByRole('button', {name: '179', exact: true}),
			).toBeVisible();
			const webMcpPlaybackState = await page.evaluate(async () => {
				const tools = (
					window as typeof window & {
						readonly __remotion_webmcp_tools: Map<
							string,
							{readonly execute: () => Promise<unknown>}
						>;
					}
				).__remotion_webmcp_tools;
				const tool = tools.get('get_playback_state');
				if (!tool) {
					throw new Error('get_playback_state was not registered');
				}

				return tool.execute();
			});
			expect(webMcpPlaybackState).toEqual({
				currentComposition: 'AnimatedBarChart',
				currentFrame: 179,
				playing: false,
				muted: false,
				volume: 1,
				playbackRate: 1.5,
				looping: true,
				timelineZoom: 0.489,
			});

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
				.getByRole('button', {name: 'Configure default apps...', exact: true})
				.click();

			const settings = page.getByRole('dialog');
			await expect(
				settings.getByTitle('Default editor', {exact: true}),
			).toBeVisible();
			await expect(
				settings.getByText('Default codec', {exact: true}),
			).toHaveCount(0);

			await page.goto(`${STUDIO_URL}/assets/test.gif`);
			await expect
				.poll(() =>
					page.evaluate(async () => {
						const tools = (
							window as typeof window & {
								readonly __remotion_webmcp_tools: Map<
									string,
									{readonly execute: () => Promise<unknown>}
								>;
							}
						).__remotion_webmcp_tools;
						const tool = tools.get('get_composition');
						return tool?.execute() ?? null;
					}),
				)
				.toEqual({
					compositionName: null,
					stack: null,
					durationInFrames: null,
					height: null,
					width: null,
					fps: null,
					currentFrame: null,
				});
			await expect
				.poll(() =>
					page.evaluate(async () => {
						const tools = (
							window as typeof window & {
								readonly __remotion_webmcp_tools: Map<
									string,
									{readonly execute: () => Promise<unknown>}
								>;
							}
						).__remotion_webmcp_tools;
						const tool = tools.get('get_playback_state');
						return tool?.execute() ?? null;
					}),
				)
				.toEqual({
					currentComposition: null,
					currentFrame: null,
					playing: null,
					muted: null,
					volume: null,
					playbackRate: null,
					looping: null,
					timelineZoom: null,
				});
			await expect
				.poll(() =>
					page.evaluate(async () => {
						const tools = (
							window as typeof window & {
								readonly __remotion_webmcp_tools: Map<
									string,
									{readonly execute: () => Promise<unknown>}
								>;
							}
						).__remotion_webmcp_tools;
						const tool = tools.get('get_canvas_html');
						return tool?.execute() ?? null;
					}),
				)
				.toEqual({
					currentComposition: null,
					currentFrame: null,
					html: null,
					htmlLength: null,
					truncated: false,
				});
			await expect
				.poll(() =>
					page.evaluate(async () => {
						const tools = (
							window as typeof window & {
								readonly __remotion_webmcp_tools: Map<
									string,
									{readonly execute: () => Promise<unknown>}
								>;
							}
						).__remotion_webmcp_tools;
						const tool = tools.get('get_outlines');
						return tool?.execute() ?? null;
					}),
				)
				.toEqual({
					currentComposition: null,
					currentFrame: null,
					outlines: [],
				});
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
		const configureDefaultApps = page.getByRole('button', {
			name: 'Configure default apps...',
		});

		await openInAnotherApp.click();
		await expect(configureDefaultApps).toBeVisible();
		// The menu overlay intercepts pointerleave; clicking it closes the menu
		// through the same outside-click path a user would take.
		await page.mouse.click(10, 100);
		await expect(configureDefaultApps).toBeHidden();
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
