import {test} from 'vitest';
import '../symbol-dispose';
import {
	gradientMaskPixelModes,
	gradientMaskPixelStops,
} from './fixtures/gradient-mask-pixel-stops';
import {testCompositions} from './utils';

test('preserves mask gradient stops at fractional export scale', async () => {
	await testCompositions({
		cases: gradientMaskPixelModes.map((mode) => ({
			composition: gradientMaskPixelStops(mode, null),
			frame: 1,
		})),
		columns: 3,
		testId: 'gradient-mask-pixel-stops',
		scale: 1.5,
	});
});
