import {expect, test} from 'vitest';
import {page, server} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	maskImage,
	maskImageTransformedVisibility,
	maskImageCulledDescendants,
} from './fixtures/mask-image';
import {captureNativeReference, compareNativePixels} from './native-reference';
import {testImage} from './utils';

test('should render mask-image', async () => {
	await page.viewport(700, 300);
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: maskImage,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'mask-image', threshold: 0.02});
});

test('should render mask-image (scaled)', async () => {
	await page.viewport(1400, 600);
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: maskImage,
			frame: 0,
			inputProps: {},
			scale: 2,
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'mask-image-scaled', threshold: 0.02});
});

test('retains masked groups transformed into the viewport', async () => {
	const composition = maskImageTransformedVisibility;
	const reference = await captureNativeReference(composition, 0, {
		omitBackground: false,
	});
	const actual = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition,
			frame: 0,
			inputProps: {},
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	const literal = new OffscreenCanvas(composition.width, composition.height);
	try {
		const context = literal.getContext('2d')!;
		context.fillStyle = 'white';
		context.fillRect(0, 0, literal.width, literal.height);
		context.fillStyle = 'red';
		for (const top of [10, 45, 80]) context.fillRect(10, top, 20, 20);
		const expected = await literal.convertToBlob({type: 'image/png'});
		const oracle = await compareNativePixels(reference, expected);
		const result = await compareNativePixels(reference, actual);
		const directory =
			'test/__results__/affine-group-visibility/' + server.browser;
		for (const [name, blob] of [
			['reference', reference],
			['actual', actual],
			['literal', expected],
			['diff', result.diff],
		] as const) {
			const bytes = new Uint8Array(await blob.arrayBuffer());
			let binary = '';
			for (const byte of bytes) binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				directory + '/' + name + '.png',
				btoa(binary),
				'base64',
			);
		}

		await server.commands.writeFile(
			directory + '/comparison.json',
			JSON.stringify(
				{
					browser: server.browser,
					platform: server.platform,
					devicePixelRatio,
					width: composition.width,
					height: composition.height,
					oracleMismatchedPixels: oracle.mismatchedPixels,
					mismatchedPixels: result.mismatchedPixels,
					maxChannelDelta: result.maxChannelDelta,
				},
				null,
				2,
			),
		);
		expect(oracle.mismatchedPixels).toBe(0);
		expect(result.mismatchedPixels).toBe(0);
	} finally {
		literal.width = 0;
		literal.height = 0;
	}
});

test('culls descendants with their transformed masked group', async () => {
	const composition = maskImageCulledDescendants;
	const reference = await captureNativeReference(composition, 0, {
		omitBackground: false,
	});
	const actual = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition,
			frame: 0,
			inputProps: {},
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	const literal = new OffscreenCanvas(composition.width, composition.height);
	try {
		const context = literal.getContext('2d')!;
		context.fillStyle = 'white';
		context.fillRect(0, 0, literal.width, literal.height);
		const expected = await literal.convertToBlob({type: 'image/png'});
		const oracle = await compareNativePixels(reference, expected);
		const result = await compareNativePixels(reference, actual);
		const directory =
			'test/__results__/culled-group-descendants/' + server.browser;
		for (const [name, blob] of [
			['reference', reference],
			['actual', actual],
			['literal', expected],
			['diff', result.diff],
		] as const) {
			const bytes = new Uint8Array(await blob.arrayBuffer());
			let binary = '';
			for (const byte of bytes) binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				directory + '/' + name + '.png',
				btoa(binary),
				'base64',
			);
		}

		await server.commands.writeFile(
			directory + '/comparison.json',
			JSON.stringify(
				{
					browser: server.browser,
					platform: server.platform,
					devicePixelRatio,
					width: composition.width,
					height: composition.height,
					oracleMismatchedPixels: oracle.mismatchedPixels,
					mismatchedPixels: result.mismatchedPixels,
					maxChannelDelta: result.maxChannelDelta,
				},
				null,
				2,
			),
		);
		expect(oracle.mismatchedPixels).toBe(0);
		expect(result.mismatchedPixels).toBe(0);
	} finally {
		literal.width = 0;
		literal.height = 0;
	}
});
