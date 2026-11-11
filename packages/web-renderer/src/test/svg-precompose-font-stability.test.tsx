import {expect, test, vi} from 'vitest';
import {server} from 'vitest/browser';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgPrecomposeFont} from './fixtures/svg-precompose-font';
import {captureNativeReference, compareNativePixels} from './native-reference';

const cases = [
	{source: 'registered', effect: 'mask', frame: 0, step: 3},
	{source: 'registered', effect: 'blend', frame: 1, step: 3},
	{source: 'import', effect: 'blend', frame: 1, step: 3},
	{source: 'registered', effect: 'blend', frame: 1, step: 4},
	{source: 'import', effect: 'blend', frame: 1, step: 4},
] as const;

test.for(cases)(
	'checks SVG font reference stability $source $effect $frame step $step',
	async ({source, effect, frame, step}, t) => {
		const composition = svgPrecomposeFont({
			source,
			effect,
			literal: false,
			fontStep: step,
			paint: null,
		});
		const control = svgPrecomposeFont({
			source,
			effect,
			literal: true,
			fontStep: step,
			paint: null,
		});
		const native = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const nativeRepeat = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const literalNative = await captureNativeReference(control, frame, {
			omitBackground: false,
		});
		const literalNativeRepeat = await captureNativeReference(control, frame, {
			omitBackground: false,
		});
		const xml: string[] = [];
		const serialize = XMLSerializer.prototype.serializeToString;
		const spy = vi
			.spyOn(XMLSerializer.prototype, 'serializeToString')
			.mockImplementation((node) => {
				const text = serialize.call(new XMLSerializer(), node);
				xml.push(text);
				return text;
			});
		let actual: Blob;
		let actualRepeat: Blob;
		let expected: Blob;
		let expectedRepeat: Blob;
		try {
			const render = async (fixture: typeof composition) =>
				(
					await renderStillOnWeb({
						composition: fixture,
						frame,
						inputProps: {},
						licenseKey: 'free-license',
						allowHtmlInCanvas: false,
					})
				).blob({format: 'png'});
			actual = await render(composition);
			actualRepeat = await render(composition);
			expected = await render(control);
			expectedRepeat = await render(control);
		} finally {
			spy.mockRestore();
		}

		const stem = `${source}-${effect}-${frame}-step${step}`;
		for (const [name, blob] of [
			['native', native],
			['native-repeat', nativeRepeat],
			['literal-native', literalNative],
			['literal-native-repeat', literalNativeRepeat],
			['actual', actual],
			['actual-repeat', actualRepeat],
			['expected', expected],
			['expected-repeat', expectedRepeat],
		] as const) {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/svg-precompose-font-stability/${server.browser}/${stem}-${name}.png`,
				btoa(binary),
				'base64',
			);
		}

		await server.commands.writeFile(
			`validation/svg-precompose-font-stability/${server.browser}/${stem}-serialized.json`,
			JSON.stringify(xml, null, 2),
			'utf8',
		);
		expect(
			(await compareNativePixels(native, nativeRepeat)).mismatchedPixels,
		).toBe(0);
		expect(
			(await compareNativePixels(literalNative, literalNativeRepeat))
				.mismatchedPixels,
		).toBe(0);
		expect(
			(await compareNativePixels(native, literalNative)).mismatchedPixels,
		).toBe(0);
		expect(
			(await compareNativePixels(actual, actualRepeat)).mismatchedPixels,
		).toBe(0);
		expect(
			(await compareNativePixels(expected, expectedRepeat)).mismatchedPixels,
		).toBe(0);
		expect((await compareNativePixels(actual, expected)).mismatchedPixels).toBe(
			0,
		);
		if (t.task.file.projectName === 'chromium')
			expect((await compareNativePixels(native, actual)).mismatchedPixels).toBe(
				0,
			);
	},
);
