import {onTestFinished, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {fontStretch} from './fixtures/text/font-stretch';
import {fontStyle} from './fixtures/text/font-style';
import {fontVariantCaps} from './fixtures/text/font-variant-caps';
import {letterSpacing} from './fixtures/text/letter-spacing';
import {paragraphs} from './fixtures/text/paragraphs';
import {textFixture} from './fixtures/text/text';
import {textTransform} from './fixtures/text/text-transform';
import {testImage} from './utils';

test('should render text', async (t) => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: textFixture,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'text-fixture',
		threshold: 0,
		allowedMismatchedPixelRatio:
			t.task.file.projectName === 'webkit'
				? 0.09
				: t.task.file.projectName === 'chromium'
					? 0.05
					: 0.001,
	});
});

test('should render paragraphs', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: paragraphs,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'paragraphs', threshold: 0.03});
});

test('should render text with letter spacing', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: letterSpacing,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'letter-spacing',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});

test('should render text with text transform', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: textTransform,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'text-transform',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});

test('should render text with font style', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: fontStyle,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'font-style',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});

test('should render text with font stretch', async (t) => {
	if (t.task.file.projectName === 'chromium') {
		const descriptor = Object.getOwnPropertyDescriptor(
			OffscreenCanvasRenderingContext2D.prototype,
			'fontStretch',
		);

		if (!descriptor?.set) {
			throw new Error('Expected offscreen canvas fontStretch setter');
		}

		Object.defineProperty(
			OffscreenCanvasRenderingContext2D.prototype,
			'fontStretch',
			{
				...descriptor,
				get: descriptor.get,
				set(value: CanvasFontStretch) {
					if ((value as string).endsWith('%')) {
						throw new TypeError(
							`The provided value '${value}' is not a valid enum value of type CanvasFontStretch.`,
						);
					}

					descriptor.set?.call(this, value);
				},
			},
		);

		onTestFinished(() => {
			Object.defineProperty(
				OffscreenCanvasRenderingContext2D.prototype,
				'fontStretch',
				descriptor,
			);
		});
	}

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: fontStretch,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'font-stretch',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});

test('should render text with font variant caps', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: fontVariantCaps,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob,
		testId: 'font-variant-caps',
		threshold: 0,
		allowedMismatchedPixelRatio: 0.01,
	});
});
