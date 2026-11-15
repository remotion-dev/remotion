import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	borderRadius,
	nativeRoundedClipping,
	nativeRoundedClipCases,
} from './fixtures/border-radius';
import {borderRadiusClamped} from './fixtures/border-radius-clamped';
import {borderRadiusDifferent} from './fixtures/border-radius-different';
import {borderRadiusElliptical} from './fixtures/border-radius-elliptical';
import {borderRadiusNested} from './fixtures/border-radius-nested';
import {borderRadiusNestedOverflowHidden} from './fixtures/border-radius-nested-overflow-hidden';
import {borderRadiusNone} from './fixtures/border-radius-none';
import {borderRadiusPercentage} from './fixtures/border-radius-percentage';
import {borderRadiusPill} from './fixtures/border-radius-pill';
import {borderRadiusSimple} from './fixtures/border-radius-simple';
import {compareNativePixels} from './native-reference';
import {testImage} from './utils';

test('should apply a border radius', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: borderRadius,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'border-radius'});
});

test('should draw image with simple border radius', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: borderRadiusSimple,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'draw-border-radius-simple'});
});

test('should draw image with elliptical border radius', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: borderRadiusElliptical,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'draw-border-radius-elliptical'});
});

test('should draw image with different corner radii', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: borderRadiusDifferent,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'draw-border-radius-different'});
});

test('should draw image with percentage border radius', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: borderRadiusPercentage,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'draw-border-radius-percentage'});
});

test('should draw image with no border radius', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: borderRadiusNone,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'draw-border-radius-none'});
});

test('should clamp border radius that exceeds maximum', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: borderRadiusClamped,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'draw-border-radius-clamped'});
});

test('should preserve circular corners when clamping a pixel border radius', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: borderRadiusPill,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'draw-border-radius-pill'});
});

test('should render nested border radii correctly', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: borderRadiusNested,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'border-radius-nested'});
});

test('should render nested border radii with overflow hidden', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: borderRadiusNestedOverflowHidden,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'border-radius-nested-overflow-hidden'});
});

test('renders CSS corners with native rounded clipping', async () => {
	const frame = 1;
	const canvas = new OffscreenCanvas(
		nativeRoundedClipping.width,
		nativeRoundedClipping.height,
	);
	try {
		const context = canvas.getContext('2d')!;
		context.fillStyle = 'white';
		context.fillRect(0, 0, canvas.width, canvas.height);
		// Use explicit normalized radii as an independent Canvas reference.
		for (const [index, sample] of nativeRoundedClipCases.entries()) {
			context.save();
			context.translate(
				20 + (index % 3) * 180 + frame * 4,
				20 + Math.floor(index / 3) * 120,
			);
			context.beginPath();
			if (sample.nativeInset > 0) {
				context.rect(
					sample.nativeInset,
					sample.nativeInset,
					100 - sample.nativeInset * 2,
					80 - sample.nativeInset * 2,
				);
			} else {
				context.roundRect(
					0,
					0,
					100,
					80,
					sample.nativeRadii.map((radius) =>
						typeof radius === 'number' ? radius : {x: radius[0], y: radius[1]},
					),
				);
			}

			context.clip();
			context.fillStyle = sample.color;
			context.fillRect(
				sample.nativeInset,
				sample.nativeInset,
				100 - sample.nativeInset * 2,
				80 - sample.nativeInset * 2,
			);
			context.restore();
		}

		const reference = await canvas.convertToBlob({type: 'image/png'});
		const actual = await (
			await renderStillOnWeb({
				licenseKey: 'free-license',
				composition: nativeRoundedClipping,
				frame,
				inputProps: {},
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const comparison = await compareNativePixels(reference, actual);
		expect(comparison.mismatchedPixels, comparison.evidence ?? undefined).toBe(
			0,
		);
	} finally {
		canvas.width = 0;
		canvas.height = 0;
	}
});
