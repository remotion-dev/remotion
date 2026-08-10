import fs from 'fs';
import {expect, test} from '@playwright/test';
import {
	EXPANDED_SIDEBAR_STATE,
	STUDIO_URL,
	visualMode3DFile,
} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({storageState: EXPANDED_SIDEBAR_STATE});

let visualMode3DSourceBefore: string;

const read2DTransformRotation = () => {
	const source = fs.readFileSync(visualMode3DFile, 'utf-8');
	const sequenceStart = source.indexOf('name="2D transform"');
	const sequenceEnd = source.indexOf('name="3D transform"');
	const sequenceSource = source.slice(sequenceStart, sequenceEnd);
	return /rotate: '([^']+)'/.exec(sequenceSource)?.[1] ?? null;
};

const read2DTransformScale = () => {
	const source = fs.readFileSync(visualMode3DFile, 'utf-8');
	const sequenceStart = source.indexOf('name="2D transform"');
	const sequenceEnd = source.indexOf('name="3D transform"');
	const sequenceSource = source.slice(sequenceStart, sequenceEnd);
	return /scale: ([^,}\n]+)/.exec(sequenceSource)?.[1] ?? null;
};

const read2DTransformOrigin = () => {
	const source = fs.readFileSync(visualMode3DFile, 'utf-8');
	const sequenceStart = source.indexOf('name="2D transform"');
	const sequenceEnd = source.indexOf('name="3D transform"');
	const sequenceSource = source.slice(sequenceStart, sequenceEnd);
	return /transformOrigin: '([^']+)'/.exec(sequenceSource)?.[1] ?? null;
};

const read3DTransformRotation = () => {
	const source = fs.readFileSync(visualMode3DFile, 'utf-8');
	const sequenceStart = source.indexOf('name="3D transform"');
	const sequenceSource = source.slice(sequenceStart);
	return /rotate: '([^']+)'/.exec(sequenceSource)?.[1] ?? null;
};

test.describe('inspector section collapse', () => {
	test.beforeEach(async () => {
		visualMode3DSourceBefore = fs.readFileSync(visualMode3DFile, 'utf-8');
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
		fs.writeFileSync(visualMode3DFile, visualMode3DSourceBefore);
	});

	test('Escape moves crop and rotation selections to the sequence', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/visual-mode-3d`);
		await expect(page).toHaveURL(/visual-mode-3d/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const transform = page.getByText('2D transform', {exact: true}).first();
		const selectedOutline = page
			.locator('polygon[stroke-opacity="1"][pointer-events="all"]')
			.first();
		const canvasRotationSurface = page.locator(
			'[data-remotion-studio-canvas-rotation]',
		);

		await transform.click();
		await expect(
			page.getByRole('button', {name: 'Show 3D transform controls'}),
		).toBeVisible();
		await expect(selectedOutline).toBeVisible();
		await selectedOutline.click({button: 'right'});
		await page.getByRole('button', {name: 'Rotate', exact: true}).click();
		await expect(canvasRotationSurface).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(canvasRotationSurface).not.toBeVisible();
		await expect(selectedOutline).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(
			page.getByRole('button', {name: 'Show 3D transform controls'}),
		).not.toBeVisible();

		await page.reload();
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);
		await transform.click();
		await expect(
			page.getByRole('button', {name: 'Show 3D transform controls'}),
		).toBeVisible();
		await expect(selectedOutline).toBeVisible();
		await selectedOutline.click({button: 'right'});
		await page.getByRole('button', {name: 'Crop', exact: true}).click();
		await expect(
			page.locator('[data-remotion-studio-crop-preview]'),
		).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(
			page.locator('[data-remotion-studio-crop-preview]'),
		).not.toBeVisible();
		await expect(selectedOutline).toBeVisible();
	});

	test('selects 3D rotation from the sequence context menu', async ({page}) => {
		await page.goto(`${STUDIO_URL}/visual-mode-3d`);
		await expect(page).toHaveURL(/visual-mode-3d/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const transform = page.getByText('2D transform', {exact: true}).first();
		await transform.click();
		await expect(
			page.getByRole('button', {name: 'Show 3D transform controls'}),
		).toBeVisible();
		const outline = page
			.locator('polygon[stroke-opacity="1"][pointer-events="all"]')
			.first();
		await expect(outline).toBeVisible();
		await outline.click({button: 'right'});
		await page.getByRole('button', {name: /^Rotate(?: all)?$/}).click();
		await expect(
			page.getByRole('button', {name: 'Rotation X', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {
				name: 'Hide 3D transform controls',
				exact: true,
			}),
		).toBeVisible();

		const rightScaleEdge = page
			.locator(
				'[data-remotion-studio-scale-edge="right"][data-remotion-studio-scale-edge-contains-selection="true"]',
			)
			.first();
		await expect(rightScaleEdge).toHaveCount(1);
		const edgeCenter = await rightScaleEdge.evaluate((element) => {
			if (!(element instanceof SVGLineElement)) {
				throw new Error('Scale edge should be an SVG line');
			}

			const matrix = element.getScreenCTM();
			if (matrix === null) {
				throw new Error('Scale edge should have a screen transform');
			}

			return new DOMPoint(
				(element.x1.baseVal.value + element.x2.baseVal.value) / 2,
				(element.y1.baseVal.value + element.y2.baseVal.value) / 2,
			).matrixTransform(matrix);
		});
		expect(
			await page.evaluate(
				({x, y}) =>
					document
						.elementFromPoint(x, y)
						?.getAttribute('data-remotion-studio-scale-edge') ?? null,
				{x: edgeCenter.x, y: edgeCenter.y},
			),
		).toBe('right');

		const scaleBefore = read2DTransformScale();
		await rightScaleEdge.dispatchEvent('pointerdown', {
			button: 0,
			buttons: 1,
			clientX: edgeCenter.x,
			clientY: edgeCenter.y,
			pointerId: 1,
		});
		await page.evaluate(
			({x, y}) => {
				window.dispatchEvent(
					new PointerEvent('pointermove', {
						buttons: 1,
						clientX: x + 60,
						clientY: y,
						pointerId: 1,
					}),
				);
				window.dispatchEvent(
					new PointerEvent('pointerup', {
						button: 0,
						buttons: 0,
						clientX: x + 60,
						clientY: y,
						pointerId: 1,
					}),
				);
			},
			{x: edgeCenter.x, y: edgeCenter.y},
		);
		await expect.poll(read2DTransformScale).not.toBe(scaleBefore);
		const canvasRotationSurface = page.locator(
			'[data-remotion-studio-canvas-rotation]',
		);
		await expect(canvasRotationSurface).toBeVisible();

		const transformOriginHandle = page
			.locator('[data-remotion-studio-transform-origin-handle]')
			.first();
		await expect(transformOriginHandle).toBeVisible();
		const dragTransformOrigin = async ({
			deltaX,
			deltaY,
			pointerId,
		}: {
			readonly deltaX: number;
			readonly deltaY: number;
			readonly pointerId: number;
		}) => {
			const transformOriginCenter = await transformOriginHandle.evaluate(
				(element) => {
					const circle = element.querySelector('circle');
					if (!(circle instanceof SVGCircleElement)) {
						throw new Error('Transform origin handle should contain a circle');
					}

					const matrix = circle.getScreenCTM();
					if (matrix === null) {
						throw new Error(
							'Transform origin handle should have a screen transform',
						);
					}

					return new DOMPoint(
						circle.cx.baseVal.value,
						circle.cy.baseVal.value,
					).matrixTransform(matrix);
				},
			);
			await transformOriginHandle.dispatchEvent('pointerdown', {
				button: 0,
				buttons: 1,
				clientX: transformOriginCenter.x,
				clientY: transformOriginCenter.y,
				pointerId,
			});
			await page.evaluate(
				({x, y, moveX, moveY, id}) => {
					window.dispatchEvent(
						new PointerEvent('pointermove', {
							buttons: 1,
							clientX: x + moveX,
							clientY: y + moveY,
							pointerId: id,
						}),
					);
					window.dispatchEvent(
						new PointerEvent('pointerup', {
							button: 0,
							buttons: 0,
							clientX: x + moveX,
							clientY: y + moveY,
							pointerId: id,
						}),
					);
				},
				{
					x: transformOriginCenter.x,
					y: transformOriginCenter.y,
					moveX: deltaX,
					moveY: deltaY,
					id: pointerId,
				},
			);
		};
		const transformOriginBefore = read2DTransformOrigin();
		await dragTransformOrigin({deltaX: 30, deltaY: 20, pointerId: 2});
		await expect.poll(read2DTransformOrigin).not.toBe(transformOriginBefore);
		await expect(canvasRotationSurface).toBeVisible();

		const compositionContainer = page.locator(
			'.remotion-studio-composition-container',
		);
		const compositionBox = await compositionContainer.boundingBox();
		const rotationSurfaceBox = await canvasRotationSurface.boundingBox();
		if (compositionBox === null || rotationSurfaceBox === null) {
			throw new Error('Rotation surface should have a visible layout');
		}

		expect(rotationSurfaceBox.width).toBeLessThan(compositionBox.width);
		expect(rotationSurfaceBox.height).toBeLessThan(compositionBox.height);
		const outsidePoint = {
			x: compositionBox.x + compositionBox.width - 4,
			y: compositionBox.y + compositionBox.height - 4,
		};
		expect(
			await page.evaluate(
				({x, y}) =>
					document
						.elementFromPoint(x, y)
						?.closest('[data-remotion-studio-canvas-rotation]') ?? null,
				outsidePoint,
			),
		).toBeNull();
		const rotationBefore = read2DTransformRotation();
		const getInteractiveRotationPoint = () =>
			canvasRotationSurface.evaluate((surface) => {
				const box = surface.getBoundingClientRect();
				for (let yIndex = 1; yIndex < 10; yIndex++) {
					for (let xIndex = 1; xIndex < 10; xIndex++) {
						const point = {
							x: box.x + (box.width * xIndex) / 10,
							y: box.y + (box.height * yIndex) / 10,
						};
						if (
							document
								.elementFromPoint(point.x, point.y)
								?.closest('[data-remotion-studio-canvas-rotation]') === surface
						) {
							return point;
						}
					}
				}

				throw new Error('Rotation surface should have an interactive point');
			});
		const insidePoint = await getInteractiveRotationPoint();
		await page.mouse.move(insidePoint.x, insidePoint.y);
		await page.mouse.down();
		await page.mouse.move(insidePoint.x + 40, insidePoint.y + 30, {steps: 5});
		await page.mouse.up();
		await expect.poll(read2DTransformRotation).not.toBe(rotationBefore);
		const transformOriginAfter3DRotation = read2DTransformOrigin();
		await dragTransformOrigin({deltaX: -20, deltaY: 25, pointerId: 3});
		await expect
			.poll(read2DTransformOrigin)
			.not.toBe(transformOriginAfter3DRotation);

		const continuedInsidePoint = await getInteractiveRotationPoint();
		const rotationXControl = page
			.getByRole('button', {name: 'Rotation X', exact: true})
			.first();
		const rotationYControl = page
			.getByRole('button', {name: 'Rotation Y', exact: true})
			.first();
		const readRotationControls = async () =>
			`${await rotationXControl.textContent()}|${await rotationYControl.textContent()}`;
		const rotationBeforeLeavingSurface = await readRotationControls();
		const sourceRotationBeforeLeavingSurface = read2DTransformRotation();
		await page.mouse.move(continuedInsidePoint.x, continuedInsidePoint.y);
		await page.mouse.down();
		await page.mouse.move(outsidePoint.x, outsidePoint.y, {steps: 5});
		await expect
			.poll(readRotationControls)
			.not.toBe(rotationBeforeLeavingSurface);
		const rotationAfterLeavingSurface = await readRotationControls();
		await page.mouse.move(outsidePoint.x - 60, outsidePoint.y, {steps: 3});
		await expect
			.poll(readRotationControls)
			.not.toBe(rotationAfterLeavingSurface);
		await page.mouse.up();
		await expect
			.poll(read2DTransformRotation)
			.not.toBe(sourceRotationBeforeLeavingSurface);

		const rotationAfterInsideDrag = read2DTransformRotation();
		await page.mouse.move(outsidePoint.x, outsidePoint.y);
		await page.mouse.down();
		await page.mouse.move(outsidePoint.x + 20, outsidePoint.y + 20);
		await page.mouse.up();
		await page.waitForTimeout(200);
		expect(read2DTransformRotation()).toBe(rotationAfterInsideDrag);
	});

	test('collapses inactive static sections and lets the user expand them', async ({
		page,
	}) => {
		await page.goto(`${STUDIO_URL}/issue-8216`);
		await expect(page).toHaveURL(/issue-8216/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		const foreground = page.locator('[title="Foreground"]').first();
		const expandBackground = page.getByRole('button', {
			name: 'Expand Background',
			exact: true,
		});
		await expect(async () => {
			await foreground.click();
			await expect(expandBackground).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 15_000});
		await expect(
			page.getByRole('button', {name: 'Expand Border', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Expand Border radius', exact: true}),
		).toBeVisible();
		await expect(
			page.getByTitle('Use individual corner radii', {exact: true}),
		).toHaveCount(0);
		await expect(
			page.getByRole('button', {name: 'Expand Crop', exact: true}),
		).toBeVisible();

		await page
			.getByRole('button', {name: 'Expand Border radius', exact: true})
			.click();
		await expect(
			page.getByTitle('Use individual corner radii', {exact: true}),
		).toBeVisible();
		const expandedBorderRadiusButton = page.getByRole('button', {
			name: 'Collapse Border radius',
			exact: true,
		});
		await expect(expandedBorderRadiusButton).toBeFocused();
		expect(
			await expandedBorderRadiusButton.evaluate((element) => {
				const style = getComputedStyle(element);
				return {boxShadow: style.boxShadow, outlineStyle: style.outlineStyle};
			}),
		).toEqual({boxShadow: 'none', outlineStyle: 'none'});

		await page.keyboard.press('Tab');
		await page.keyboard.press('Shift+Tab');
		await expect(expandedBorderRadiusButton).toBeFocused();
		expect(
			await expandedBorderRadiusButton.evaluate(
				(element) => getComputedStyle(element).boxShadow,
			),
		).not.toBe('none');

		await page.getByRole('button', {name: 'Expand Crop', exact: true}).click();
		await expect(
			page.getByRole('button', {name: 'Collapse Crop', exact: true}),
		).toBeVisible();
		await expect(page.getByText('Crop left', {exact: true})).toBeVisible();

		await page
			.locator('[title="Default absolute-fill layout"]')
			.first()
			.click();
		await expect(
			page.getByRole('button', {name: 'Expand Layout', exact: true}),
		).toBeVisible();
		await page
			.getByRole('button', {name: 'Expand Layout', exact: true})
			.click();
		await expect(page.getByText('Premount For', {exact: true})).toBeVisible();

		await page.locator('[title="Default none layout"]').first().click();
		await expect(
			page.getByRole('button', {name: 'Expand Layout', exact: true}),
		).toBeVisible();

		await page.locator('[title="Default premount"]').first().click();
		await expect(
			page.getByRole('button', {name: 'Expand Layout', exact: true}),
		).toBeVisible();

		await page.goto(`${STUDIO_URL}/visual-mode-3d`);
		await expect(page).toHaveURL(/visual-mode-3d/, {timeout: 15_000});
		await page.waitForFunction(
			() => !document.body.innerText.includes('Loading...'),
			{timeout: 30_000},
		);

		await page.locator('[title="2D transform"]').first().click();
		const show3DControls = page.getByRole('button', {
			name: 'Show 3D transform controls',
			exact: true,
		});
		await expect(show3DControls).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Scale Z', exact: true}),
		).toHaveCount(0);
		await expect(
			page.getByRole('button', {name: 'Rotation Z', exact: true}),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Rotation X', exact: true}),
		).toHaveCount(0);
		await page.getByTitle('Rotation', {exact: true}).click();
		const compositionContainer = page.locator(
			'.remotion-studio-composition-container',
		);
		const compositionBox = await compositionContainer.boundingBox();
		if (compositionBox === null) {
			throw new Error('Composition should have a visible layout');
		}

		await page.mouse.move(
			compositionBox.x + compositionBox.width / 2,
			compositionBox.y + compositionBox.height / 2,
		);
		const canvasRotationSurface = page.locator(
			'[data-remotion-studio-canvas-rotation]',
		);
		await expect(canvasRotationSurface).toBeVisible();
		await expect(
			page.locator('[data-remotion-studio-transform-origin-handle]').first(),
		).toBeVisible();
		const rotationSurfaceBox = await canvasRotationSurface.boundingBox();
		if (rotationSurfaceBox === null) {
			throw new Error('Canvas rotation surface should have a visible layout');
		}

		const startX = rotationSurfaceBox.x + rotationSurfaceBox.width * 0.25;
		const startY = rotationSurfaceBox.y + rotationSurfaceBox.height * 0.25;
		await page.mouse.move(startX, startY);
		await page.mouse.down();
		await page.mouse.move(startX + 60, startY + 80, {steps: 5});
		await page.mouse.up();
		await expect.poll(read2DTransformRotation).toMatch(/^-?\d+(?:\.\d+)?deg$/);

		await show3DControls.click();
		await expect(
			page.getByRole('button', {name: 'Scale Z', exact: true}),
		).toBeVisible();
		await page.getByTitle('Rotation', {exact: true}).click();
		await page.mouse.move(
			compositionBox.x + compositionBox.width / 2,
			compositionBox.y + compositionBox.height / 2,
		);
		await expect(canvasRotationSurface).toBeVisible();
		const threeDRotationSurfaceBox = await canvasRotationSurface.boundingBox();
		if (threeDRotationSurfaceBox === null) {
			throw new Error(
				'3D canvas rotation surface should have a visible layout',
			);
		}

		const threeDStartX =
			threeDRotationSurfaceBox.x + threeDRotationSurfaceBox.width * 0.25;
		const threeDStartY =
			threeDRotationSurfaceBox.y + threeDRotationSurfaceBox.height * 0.25;
		await page.mouse.move(threeDStartX, threeDStartY);
		await page.mouse.down();
		await page.mouse.move(threeDStartX + 80, threeDStartY + 60, {steps: 5});
		await page.mouse.up();
		await expect
			.poll(() => read2DTransformRotation()?.split(' ').length)
			.toBe(4);
		const scaleLabelBox = await page
			.getByTitle('Scale', {exact: true})
			.first()
			.boundingBox();
		const scaleXBox = await page
			.getByRole('button', {name: 'Scale X', exact: true})
			.first()
			.boundingBox();
		const scaleZBox = await page
			.getByRole('button', {name: 'Scale Z', exact: true})
			.first()
			.boundingBox();
		if (scaleLabelBox === null || scaleXBox === null || scaleZBox === null) {
			throw new Error('Scale controls should have a visible layout');
		}

		expect(
			scaleZBox.y - (scaleLabelBox.y + scaleLabelBox.height),
		).toBeGreaterThanOrEqual(-1);
		expect(
			scaleZBox.y - (scaleLabelBox.y + scaleLabelBox.height),
		).toBeLessThanOrEqual(1);
		await expect(
			page.getByRole('button', {name: 'Rotation X', exact: true}).first(),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Rotation Y', exact: true}).first(),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Rotation Z', exact: true}).first(),
		).toBeVisible();
		const rotationLabelBox = await page
			.getByTitle('Rotation', {exact: true})
			.first()
			.boundingBox();
		const rotationXBox = await page
			.getByRole('button', {name: 'Rotation X', exact: true})
			.first()
			.boundingBox();
		if (rotationLabelBox === null || rotationXBox === null) {
			throw new Error('Rotation controls should have a visible layout');
		}

		expect(
			rotationXBox.y - (rotationLabelBox.y + rotationLabelBox.height),
		).toBeGreaterThanOrEqual(-1);
		expect(
			rotationXBox.y - (rotationLabelBox.y + rotationLabelBox.height),
		).toBeLessThanOrEqual(1);
		expect(Math.abs(scaleXBox.x - rotationXBox.x)).toBeLessThanOrEqual(1);
		await expect(
			page
				.getByRole('button', {name: 'Transform origin Z', exact: true})
				.first(),
		).toBeVisible();

		const threeDTransformElement = page
			.locator('[title="3D transform"]')
			.first();
		await threeDTransformElement.click();
		await expect(
			page
				.getByRole('button', {
					name: '3D controls are required by the current transform values',
					exact: true,
				})
				.first(),
		).toBeDisabled();
		await expect(
			page.getByRole('button', {name: 'Scale Z', exact: true}).first(),
		).toBeVisible();
		await expect(
			page.getByRole('button', {name: 'Rotation X', exact: true}).first(),
		).not.toContainText('X ');
		await page.getByTitle('Rotation', {exact: true}).click();
		const rotationX = page
			.getByRole('button', {name: 'Rotation X', exact: true})
			.first();
		const rotationY = page
			.getByRole('button', {name: 'Rotation Y', exact: true})
			.first();
		const rotationZ = page
			.getByRole('button', {name: 'Rotation Z', exact: true})
			.first();
		const rotationXBefore = await rotationX.textContent();
		const rotationYBefore = await rotationY.textContent();
		const rotationZBefore = await rotationZ.textContent();
		const sourceRotationBefore = read3DTransformRotation();
		await page.locator('[title="3D transform"]').last().hover();
		const getRotationCornerCenter = async (
			corner: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left',
		) => {
			const box = await page
				.locator(
					`[data-remotion-studio-rotation-corner="${corner}"][data-remotion-studio-rotation-corner-contains-selection="true"]`,
				)
				.first()
				.boundingBox();
			if (box === null) {
				throw new Error(`The ${corner} rotation corner should be visible`);
			}

			return {x: box.x + box.width / 2, y: box.y + box.height / 2};
		};
		const [topLeft, topRight, bottomRight, bottomLeft] = await Promise.all([
			getRotationCornerCenter('top-left'),
			getRotationCornerCenter('top-right'),
			getRotationCornerCenter('bottom-right'),
			getRotationCornerCenter('bottom-left'),
		]);
		const topEdgeLength = Math.hypot(
			topRight.x - topLeft.x,
			topRight.y - topLeft.y,
		);
		const bottomEdgeLength = Math.hypot(
			bottomRight.x - bottomLeft.x,
			bottomRight.y - bottomLeft.y,
		);
		expect(Math.abs(topEdgeLength - bottomEdgeLength)).toBeGreaterThan(1);
		const selectedRotationCorner = page
			.locator(
				'[data-remotion-studio-rotation-corner="top-right"][data-remotion-studio-rotation-corner-contains-selection="true"]',
			)
			.first();
		await expect(selectedRotationCorner).toBeVisible();
		const selectedRotationCornerBox =
			await selectedRotationCorner.boundingBox();
		if (selectedRotationCornerBox === null) {
			throw new Error('Selected rotation corner should have a visible layout');
		}

		const cornerX =
			selectedRotationCornerBox.x + selectedRotationCornerBox.width / 2;
		const cornerY =
			selectedRotationCornerBox.y + selectedRotationCornerBox.height / 2;
		expect(
			await page.evaluate(
				({x, y}) =>
					document
						.elementFromPoint(x, y)
						?.getAttribute('data-remotion-studio-rotation-corner') ?? null,
				{x: cornerX, y: cornerY},
			),
		).toBe('top-right');
		await selectedRotationCorner.dispatchEvent('pointerdown', {
			button: 0,
			buttons: 1,
			clientX: cornerX,
			clientY: cornerY,
			pointerId: 1,
		});
		await page.evaluate(
			({x, y}) => {
				window.dispatchEvent(
					new PointerEvent('pointermove', {
						buttons: 1,
						clientX: x + 60,
						clientY: y + 40,
						pointerId: 1,
					}),
				);
				window.dispatchEvent(
					new PointerEvent('pointerup', {
						button: 0,
						buttons: 0,
						clientX: x + 60,
						clientY: y + 40,
						pointerId: 1,
					}),
				);
			},
			{x: cornerX, y: cornerY},
		);
		await expect.poll(read3DTransformRotation).not.toBe(sourceRotationBefore);
		await expect
			.poll(() => read3DTransformRotation()?.split(' ').length)
			.toBe(4);
		await expect(rotationX).toHaveText(rotationXBefore ?? '');
		await expect(rotationY).toHaveText(rotationYBefore ?? '');
		await expect(rotationZ).not.toHaveText(rotationZBefore ?? '');
		await expect
			.poll(async () => {
				const [nextTopLeft, nextTopRight] = await Promise.all([
					getRotationCornerCenter('top-left'),
					getRotationCornerCenter('top-right'),
				]);
				return Math.abs(nextTopLeft.y - nextTopRight.y);
			})
			.toBeGreaterThan(1);
	});
});
