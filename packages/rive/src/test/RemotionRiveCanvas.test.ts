import {expect, test} from 'bun:test';
import {riveCanvasSchema} from '../RemotionRiveCanvas.js';

test('<RemotionRiveCanvas> exposes crop controls after border controls', () => {
	const keys = Object.keys(riveCanvasSchema);

	for (const cropProp of ['cropLeft', 'cropRight', 'cropTop', 'cropBottom']) {
		expect(cropProp in riveCanvasSchema).toBe(true);
		expect(keys.indexOf(cropProp)).toBeGreaterThan(
			keys.indexOf('style.borderColor'),
		);
	}
});
