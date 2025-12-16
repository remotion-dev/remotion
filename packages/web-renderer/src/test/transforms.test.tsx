import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {accumulatedTransforms} from './fixtures/accumulated-transforms';
import {complexNestedSvg} from './fixtures/complex-nested-svg';
import {flexPositionedScaled} from './fixtures/flex-positioned-scaled';
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
import {unwrapped} from './fixtures/unwrapped';
import {testImage} from './utils';

test('should be able to deal with a simple transform directly on the element', async () => {
	const blob = await renderStillOnWeb({
		composition: simpleRotatedSvg,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'simple-rotated-svg'});
});

test('should be able to deal with a simple transform on the parent', async () => {
	const blob = await renderStillOnWeb({
		composition: parentRotatedSvg,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'parent-rotated-svg'});
});

test('should be able to deal with a transform-origin on itself', async () => {
	const blob = await renderStillOnWeb({
		composition: selfTransformOrigin,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'self-transform-origin'});
});

test('should be able to deal with a transform-origin on parent', async () => {
	const blob = await renderStillOnWeb({
		composition: parentTransformOrigin,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'parent-transform-origin'});
});

test('accumulated transforms', async () => {
	const blob = await renderStillOnWeb({
		composition: accumulatedTransforms,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'accumulated-transforms'});
});

test('transformed canvases', async () => {
	const blob = await renderStillOnWeb({
		composition: rotatedCanvas,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'rotated-canvas'});
});

test('multi-level nested transforms with distinct transform-origins', async () => {
	const blob = await renderStillOnWeb({
		composition: multiLevelTransformOrigins,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'multi-level-transform-origins'});
});

test('three-level nested transforms with varying origins', async () => {
	const blob = await renderStillOnWeb({
		composition: threeLevelTransformOrigins,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'three-level-transform-origins'});
});

test('nested transforms with pixel-based transform-origins', async () => {
	const blob = await renderStillOnWeb({
		composition: pixelTransformOrigin,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'pixel-transform-origin'});
});

test('complicated example', async () => {
	await page.viewport(1080, 1080);

	const blob = await renderStillOnWeb({
		composition: complexNestedSvg,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'complex-nested-svg'});
});

test('even harder case', async () => {
	await page.viewport(1080, 1080);
	const blob = await renderStillOnWeb({
		composition: nestedTranslateScale,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'nested-translate-scale'});
});

test('flex-positioned scaled elements', async () => {
	await page.viewport(200, 200);
	const blob = await renderStillOnWeb({
		composition: flexPositionedScaled,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'flex-positioned-scaled'});
});

test('Github Unwrapped example', async () => {
	await page.viewport(1080, 1080);

	const blob = await renderStillOnWeb({
		composition: unwrapped,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'unwrapped'});
});

test('Should render orthographically if no perspective is set', async () => {
	await page.viewport(1080, 1080);

	const blob = await renderStillOnWeb({
		composition: orthographic,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'orthographic'});
});

test('Should render with margin', async () => {
	await page.viewport(1080, 1080);

	const blob = await renderStillOnWeb({
		composition: withMargin,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'with-margin'});
});
