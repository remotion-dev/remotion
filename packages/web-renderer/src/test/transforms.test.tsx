import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {accumulatedTransforms} from './fixtures/accumulated-transforms';
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
import {threeLevelTransformOrigins} from './fixtures/three-level-transform-origins';
import {orthographic} from './fixtures/transforms/orthographic';
import {withMargin} from './fixtures/transforms/with-margin';
import {withNegativeMargin} from './fixtures/transforms/with-negative-margin';
import {unwrapped} from './fixtures/unwrapped';
import {svgExplicitDimensions} from './fixtures/svg-explicit-dimensions';
import {testImage} from './utils';

test('should be able to deal with a simple transform directly on the element', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: simpleRotatedSvg,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'simple-rotated-svg'});
});

test('should be able to deal with a simple transform on the parent', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: parentRotatedSvg,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'parent-rotated-svg'});
});

test('should be able to deal with a transform-origin on itself', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: selfTransformOrigin,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'self-transform-origin'});
});

test('should be able to deal with a transform-origin on parent', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: parentTransformOrigin,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'parent-transform-origin'});
});

test('accumulated transforms', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: accumulatedTransforms,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'accumulated-transforms'});
});

test('transformed canvases', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: rotatedCanvas,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'rotated-canvas'});
});

test('multi-level nested transforms with distinct transform-origins', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: multiLevelTransformOrigins,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'multi-level-transform-origins'});
});

test('three-level nested transforms with varying origins', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: threeLevelTransformOrigins,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'three-level-transform-origins'});
});

test('nested transforms with pixel-based transform-origins', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: pixelTransformOrigin,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'pixel-transform-origin'});
});

test('complicated example', async () => {
	await page.viewport(1080, 1080);

	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: complexNestedSvg,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'complex-nested-svg'});
});

test('even harder case', async () => {
	await page.viewport(1080, 1080);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: nestedTranslateScale,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'nested-translate-scale'});
});

test('flex-positioned scaled elements', async () => {
	await page.viewport(200, 200);
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: flexPositionedScaled,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'flex-positioned-scaled'});
});

test('Github Unwrapped example', async () => {
	await page.viewport(1080, 1080);

	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: unwrapped,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'unwrapped',
		allowedMismatchedPixelRatio: 0.001,
	});
});

test('Inside 3d transform', async () => {
	await page.viewport(1080, 1080);

	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: inside3dTransform,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({
		blob,
		testId: 'inside-3d-transform',
		allowedMismatchedPixelRatio: 0.001,
	});
});

test('Should render orthographically if no perspective is set', async () => {
	await page.viewport(1080, 1080);

	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: orthographic,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'orthographic'});
});

test('Should render with margin', async () => {
	await page.viewport(1080, 1080);

	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: withMargin,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'with-margin'});
});

test('Should render with negative margin', async () => {
	await page.viewport(1080, 1080);

	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: withNegativeMargin,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'with-negative-margin'});
});

test('SVG with explicit width/height props should render at specified size (issue #6186)', async () => {
	await page.viewport(1080, 1080);

	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: svgExplicitDimensions,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'svg-explicit-dimensions'});
});
