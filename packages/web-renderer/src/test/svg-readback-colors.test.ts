import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	svgExternalCarrierModes,
	svgExternalEmptyCarrier,
	svgExternalFontReady,
	svgExternalFontSelection,
	svgExternalStyleSelectors,
} from './fixtures/svg-external-font-selection';
import {
	svgFontFamilyLifetime,
	svgFontFamilyLifetimeReady,
} from './fixtures/svg-font-family-lifetime';
import {svgReadbackMask} from './fixtures/svg-readback-mask';
import {captureNativeReference, compareNativePixels} from './native-reference';

const cases = [
	...[0, 1, 2].map((frame) => ({composition: svgFontFamilyLifetime, frame})),
	{composition: svgReadbackMask('important'), frame: 0},
	...[
		svgExternalFontSelection,
		svgExternalStyleSelectors({literal: false}),
		...svgExternalCarrierModes
			.filter((mode) => mode !== 'cache')
			.map((mode) => svgExternalEmptyCarrier({mode, literal: false})),
	].map((composition) => ({composition, frame: 1})),
].map((entry) => ({...entry, id: `${entry.composition.id}-${entry.frame}`}));

test.skipIf(server.browser !== 'webkit')(
	'matches native WebKit colors across registered SVG font fixtures',
	async () => {
		await Promise.all([svgFontFamilyLifetimeReady, svgExternalFontReady]);
		for (const {composition, frame, id} of cases) {
			const still = await renderStillOnWeb({
				composition,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			});
			const actual = await still.blob({format: 'png'});
			const reference = await captureNativeReference(composition, frame, {
				omitBackground: false,
			});
			expect
				.soft(
					(await compareNativePixels(reference, actual)).mismatchedPixels,
					id,
				)
				.toBe(0);
		}
	},
	30000,
);
