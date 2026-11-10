import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {
	calculateTransforms,
	type TransformStyleCache,
} from '../drawing/calculate-transforms';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import {accumulatedTransforms} from './fixtures/accumulated-transforms';
import {complexNestedSvg} from './fixtures/complex-nested-svg';
import '../symbol-dispose';
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
import {styleAttributeCleanupFixture} from './fixtures/style-attribute-cleanup';
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

const mountStyleOwnershipSvg = () => {
	const host = document.createElement('div');
	host.innerHTML = '<svg width="100" height="80"></svg>';
	const element = host.firstElementChild as SVGSVGElement;
	document.body.appendChild(host);
	return {host, element};
};

test.for([null, ''])(
	'restores transform measurement style ownership for initial attribute %s',
	(initial) => {
		const {host, element} = mountStyleOwnershipSvg();
		if (initial !== null) {
			element.setAttribute('style', initial);
			host.setAttribute('style', initial);
		}

		const cache: TransformStyleCache = new WeakMap();
		try {
			const observations = [];
			for (let read = 0; read < 2; read++) {
				const plan = calculateTransforms({
					element,
					rootElement: host,
					transformStyleCache: cache,
					isolated: false,
				});
				plan[Symbol.dispose]();
				observations.push([
					element.getAttribute('style'),
					host.getAttribute('style'),
				]);
			}

			expect(observations).toEqual([
				[initial, initial],
				[initial, initial],
			]);
		} finally {
			host.remove();
		}
	},
);

test('restores transform measurement style ownership including priorities', () => {
	const {host, element} = mountStyleOwnershipSvg();
	const properties = [
		'transition-property',
		'transition-duration',
		'transition-timing-function',
		'transition-delay',
		'transition-behavior',
		'transform',
		'scale',
		'rotate',
	];
	element.style.setProperty('transition-property', 'transform', 'important');
	element.style.setProperty('transition-duration', '1s');
	element.style.setProperty('transition-delay', '.2s', 'important');
	element.style.setProperty('transform', 'translateX(2px)', 'important');
	element.style.setProperty('scale', '1.25', 'important');
	element.style.setProperty('rotate', '5deg', 'important');
	const before = properties.map((property) => [
		element.style.getPropertyValue(property),
		element.style.getPropertyPriority(property),
	]);
	try {
		const plan = calculateTransforms({
			element,
			rootElement: host,
			transformStyleCache: new WeakMap(),
			isolated: false,
		});
		plan[Symbol.dispose]();
		expect(
			properties.map((property) => [
				element.style.getPropertyValue(property),
				element.style.getPropertyPriority(property),
			]),
		).toEqual(before);
	} finally {
		host.remove();
	}
});

for (const {name, transition, priority} of [
	{name: 'whole-value', transition: 'var(--transition)', priority: ''},
	{
		name: 'whole-value-important',
		transition: 'var(--transition)',
		priority: 'important',
	},
	{
		name: 'duration-value',
		transition: 'opacity var(--duration) ease',
		priority: '',
	},
	{
		name: 'duration-value-important',
		transition: 'opacity var(--duration) ease',
		priority: 'important',
	},
]) {
	test(`restores variable transition shorthand ${name} after measurement`, () => {
		const {host, element} = mountStyleOwnershipSvg();
		const cache: TransformStyleCache = new WeakMap();
		const observations = [];
		const expected = [];
		try {
			for (const target of [element, host]) {
				target.style.setProperty('--transition', 'opacity 2s linear');
				target.style.setProperty('--duration', '2s');
				target.style.setProperty('transition', transition, priority);
			}

			const originals = [element, host].map((target) => [
				target.style.getPropertyValue('transition'),
				target.style.getPropertyPriority('transition'),
			]);
			for (let read = 0; read < 2; read++) {
				const plan = calculateTransforms({
					element,
					rootElement: host,
					transformStyleCache: cache,
					isolated: false,
				});
				element.style.setProperty('--duration', '3s', 'important');
				plan[Symbol.dispose]();
				observations.push([
					[element, host].map((target) => [
						target.style.getPropertyValue('transition'),
						target.style.getPropertyPriority('transition'),
					]),
					element.style.getPropertyValue('--duration'),
					element.style.getPropertyPriority('--duration'),
				]);
				expected.push([originals, '3s', 'important']);
			}

			expect(observations).toEqual(expected);
		} finally {
			host.remove();
		}
	});
}

test('restores transform measurement style ownership without erasing unrelated authored updates', () => {
	const {host, element} = mountStyleOwnershipSvg();
	try {
		const plan = calculateTransforms({
			element,
			rootElement: host,
			transformStyleCache: new WeakMap(),
			isolated: false,
		});
		element.style.setProperty('color', 'rgb(1, 2, 3)', 'important');
		element.style.setProperty('--authored-update', 'kept', 'important');
		plan[Symbol.dispose]();
		expect(element.style.getPropertyValue('color')).toBe('rgb(1, 2, 3)');
		expect(element.style.getPropertyPriority('color')).toBe('important');
		expect(element.style.getPropertyValue('--authored-update')).toBe('kept');
		expect(element.style.getPropertyPriority('--authored-update')).toBe(
			'important',
		);
		expect(element.hasAttribute('style')).toBe(true);
	} finally {
		host.remove();
	}
});

test('preserves following-sibling paint after zero-size SVG transform cleanup', async () => {
	const fixture = styleAttributeCleanupFixture(false);
	const frames = await renderFramesOnWeb({
		composition: fixture,
		frames: [0, 1],
		inputProps: {},
		licenseKey: 'free-license',
		allowHtmlInCanvas: false,
	});
	const differences = [];
	for (const frame of [0, 1]) {
		const native = await captureNativeReference(fixture, frame, {
			omitBackground: false,
		});
		const batch = await frames[frame].blob({format: 'png'});
		const fresh = await (
			await renderStillOnWeb({
				composition: fixture,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const literal = await (
			await renderStillOnWeb({
				composition: styleAttributeCleanupFixture(true),
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		differences.push(
			(await compareNativePixels(native, batch)).mismatchedPixels,
			(await compareNativePixels(literal, batch)).mismatchedPixels,
			(await compareNativePixels(fresh, batch)).mismatchedPixels,
		);
	}

	expect(differences).toEqual([0, 0, 0, 0, 0, 0]);
});
