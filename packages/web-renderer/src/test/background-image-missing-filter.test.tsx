import {beforeAll, expect, test} from 'vitest';
import {server} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	backgroundImageMissingFilter,
	missingFilterBackgroundSources,
} from './fixtures/background-image-missing-filter';
import {captureNativeReference, compareNativePixels} from './native-reference';

beforeAll(async () => {
	await Promise.all(
		missingFilterBackgroundSources.map(async (url) => {
			const image = new Image();
			image.src = url;
			await image.decode();
		}),
	);
});

test.for([1, 2].flatMap((scale) => [0, 1].map((frame) => ({scale, frame}))))(
	'retains native pixelated background at scale $scale frame $frame',
	async ({scale, frame}) => {
		const composition = backgroundImageMissingFilter('plain', scale);
		const reference = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const actual = await (
			await renderStillOnWeb({
				composition,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const repeat = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		for (const [name, blob] of [
			['native', reference],
			['actual', actual],
			['repeat', repeat],
		] as const) {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/background-image-missing-filter/${server.browser}/plain-${scale}-${frame}-${name}.png`,
				btoa(binary),
				'base64',
			);
		}

		expect(
			(await compareNativePixels(reference, repeat)).mismatchedPixels,
		).toBe(0);
		const comparison = await compareNativePixels(reference, actual);
		expect(comparison.mismatchedPixels).toBe(0);
		expect(comparison.maxChannelDelta).toBe(0);
	},
);
