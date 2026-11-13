import {test} from 'vitest';
import '../symbol-dispose';
import {
	svgAdoptedFont,
	svgAdoptedFontGroups,
} from './fixtures/svg-adopted-font';
import {
	svgExternalFontReady,
	svgExternalCarrierModes,
	svgExternalEmptyCarrier,
} from './fixtures/svg-external-font-selection';
import {testCompositions} from './utils';

test('retains adopted fonts and registered stylesheet carriers', async () => {
	await svgExternalFontReady;
	await testCompositions({
		cases: [
			...svgAdoptedFontGroups.map((group) => ({
				composition: svgAdoptedFont({group, literal: false}),
				frame: 1,
			})),
			...svgExternalCarrierModes.map((mode) => ({
				composition: svgExternalEmptyCarrier({mode, literal: false}),
				frame: 1,
			})),
		],
		columns: 3,
		testId: 'svg-adopted-fonts-and-carriers',
		scale: null,
	});
});
