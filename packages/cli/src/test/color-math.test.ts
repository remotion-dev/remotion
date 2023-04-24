import {expect, test} from 'vitest';
import {getZColorIfPossible} from '../editor/components/get-zod-if-possible';

const getZColor = async () => {
	const z = await getZColorIfPossible();
	if (!z) {
		throw new Error('z-color not found');
	}

	return z;
};

test('Color math', async () => {
	const mod = await getZColor();
	expect(mod.ZColorInternals.parseColor('rgba(255, 255, 255, 0.5)')).toEqual({
		a: 128,
		r: 255,
		b: 255,
		g: 255,
	});
});
