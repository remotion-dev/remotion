import {test} from 'vitest';
import '../symbol-dispose';
import {
	gradientPaintContext,
	gradientPaintModes,
} from './fixtures/gradient-paint-context';
import {
	gradientPixelModes,
	gradientPixelStops,
} from './fixtures/gradient-pixel-stops';
import {testCompositions} from './utils';

test('preserves gradient stops and paint context', async () => {
	await testCompositions({
		cases: [
			...gradientPixelModes.map((mode) => ({
				composition: gradientPixelStops(mode),
				frame: 1,
			})),
			...gradientPaintModes.map((mode) => ({
				composition: gradientPaintContext(mode),
				frame: 1,
			})),
		],
		columns: 3,
		testId: 'gradient-pixel-stops-and-context',
		scale: null,
	});
});
