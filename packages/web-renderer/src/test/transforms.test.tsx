import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {
	calculateTransforms,
	type TransformStyleCache,
} from '../drawing/calculate-transforms';
import {renderStillOnWeb} from '../render-still-on-web';
import {accumulatedTransforms} from './fixtures/accumulated-transforms';
import '../symbol-dispose';
import {complexNestedSvg} from './fixtures/complex-nested-svg';
import {flexPositionedScaled} from './fixtures/flex-positioned-scaled';
import {inside3dTransform} from './fixtures/inside-3d-transform';
import {multiLevelTransformOrigins} from './fixtures/multi-level-transform-origins';
import {nestedTranslateScale} from './fixtures/nested-translate-scale';
import {parentRotatedSvg} from './fixtures/parent-rotated-svg';
import {parentTransformOrigin} from './fixtures/parent-transform-origin';
import {pixelTransformOrigin} from './fixtures/pixel-transform-origin';
import {rotatedCanvas} from './fixtures/rotated-canvas';
import {selfTransformOrigin} from './fixtures/self-transform-origin';
import {simpleRotatedSvg} from './fixtures/simple-rotated-svg';
import {svgExplicitDimensions} from './fixtures/svg-explicit-dimensions';
import {threeLevelTransformOrigins} from './fixtures/three-level-transform-origins';
import {
	transformPrecisionValues,
	geometric2dTransforms,
	transformGeometric2d,
} from './fixtures/transform-precision';
import {orthographic} from './fixtures/transforms/orthographic';
import {withMargin} from './fixtures/transforms/with-margin';
import {withNegativeMargin} from './fixtures/transforms/with-negative-margin';
import {unwrapped} from './fixtures/unwrapped';
import {captureNativeReference, compareNativePixels} from './native-reference';
import {testImage} from './utils';

test('should be able to deal with a simple transform directly on the element', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: simpleRotatedSvg,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'simple-rotated-svg'});
});

test('should be able to deal with a simple transform on the parent', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: parentRotatedSvg,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'parent-rotated-svg'});
});

test('should be able to deal with a transform-origin on itself', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: selfTransformOrigin,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'self-transform-origin'});
});

test('should be able to deal with a transform-origin on parent', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: parentTransformOrigin,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'parent-transform-origin'});
});

test('accumulated transforms', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: accumulatedTransforms,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'accumulated-transforms'});
});

test('transformed canvases', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: rotatedCanvas,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'rotated-canvas'});
});

test('multi-level nested transforms with distinct transform-origins', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: multiLevelTransformOrigins,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'multi-level-transform-origins'});
});

test('three-level nested transforms with varying origins', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: threeLevelTransformOrigins,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'three-level-transform-origins'});
});

test('nested transforms with pixel-based transform-origins', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: pixelTransformOrigin,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'pixel-transform-origin'});
});

test('complicated example', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: complexNestedSvg,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'complex-nested-svg'});
});

test('even harder case', async () => {
	await page.viewport(1080, 1080);
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: nestedTranslateScale,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'nested-translate-scale'});
});

test('flex-positioned scaled elements', async () => {
	await page.viewport(200, 200);
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: flexPositionedScaled,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'flex-positioned-scaled'});
});

test('Github Unwrapped example', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: unwrapped,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'unwrapped',
		allowedMismatchedPixelRatio: 0.001,
	});
});

test('Inside 3d transform', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: inside3dTransform,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'inside-3d-transform',
		allowedMismatchedPixelRatio: 0.001,
	});
});

test('Should render orthographically if no perspective is set', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: orthographic,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'orthographic'});
});

test('Should render with margin', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: withMargin,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'with-margin'});
});

test('Should render with negative margin', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: withNegativeMargin,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'with-negative-margin'});
});

test('SVG with explicit width/height props should render at specified size (issue #6186)', async () => {
	await page.viewport(1080, 1080);

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: svgExplicitDimensions,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'svg-explicit-dimensions'});
});

// Rounded computed-style matrices lost native rotation/skew precision.
test('preserves native transform precision across cached reads', (t) => {
	if (
		typeof CSSTransformValue === 'undefined' ||
		!('computedStyleMap' in Element.prototype)
	) {
		t.skip();
		return;
	}

	for (const transform of [
		...transformPrecisionValues,
		...geometric2dTransforms,
	]) {
		const element = document.createElement('div');
		Object.assign(element.style, {
			position: 'fixed',
			left: '0px',
			top: '0px',
			width: '100px',
			height: '80px',
			transformOrigin: '0 0',
			transform,
		});
		const child = document.createElement('div');
		Object.assign(child.style, {position: 'absolute', inset: '0'});
		element.appendChild(child);
		document.body.appendChild(element);
		try {
			const value = element
				.computedStyleMap()
				.get('transform') as CSSTransformValue;
			const reference = transform.includes('%')
				? new DOMMatrix(getComputedStyle(element).transform)
				: value.toMatrix();
			const expectedIs2D = new DOMMatrix(getComputedStyle(element).transform)
				.is2D;
			const expected = Array.from(reference.toFloat64Array(), (n) =>
				n === 0 ? 0 : n,
			);
			const cache: TransformStyleCache = new WeakMap();
			for (let read = 0; read < 2; read++) {
				using plan = calculateTransforms({
					element: child,
					rootElement: element,
					transformStyleCache: cache,
					isolated: false,
				});
				expect(
					Array.from(plan.totalMatrix.toFloat64Array(), (n) =>
						n === 0 ? 0 : n,
					),
				).toEqual(expected);
				expect(plan.totalMatrix.is2D).toBe(expectedIs2D);
				plan.totalMatrix.a = 42;
			}
		} finally {
			element.remove();
		}
	}
});

test('keeps zero-angle 3D rotations geometrically 2D under strong downscaling', async () => {
	for (const frame of [0, 1]) {
		const blob = await (
			await renderStillOnWeb({
				licenseKey: 'free-license',
				composition: transformGeometric2d,
				frame,
				inputProps: {},
			})
		).blob({format: 'png'});
		const reference = await captureNativeReference(
			transformGeometric2d,
			frame,
			{omitBackground: false},
		);
		expect((await compareNativePixels(reference, blob)).mismatchedPixels).toBe(
			0,
		);
		const bitmap = await createImageBitmap(blob);
		try {
			const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
			const context = canvas.getContext('2d')!;
			context.drawImage(bitmap, 0, 0);
			for (const x of [25, 85])
				expect(Array.from(context.getImageData(x, 25, 1, 1).data)).toEqual([
					255, 0, 0, 255,
				]);
		} finally {
			bitmap.close();
		}
	}
});
