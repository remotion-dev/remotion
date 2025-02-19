import {expect, test} from 'bun:test';
import {getZTypesIfPossible} from '../components/get-zod-if-possible';

const getZodTypes = async () => {
	const z = await getZTypesIfPossible();
	if (!z) {
		throw new Error('@remotion/zod-types not found');
	}

	return z;
};

test('Color math', async () => {
	const mod = await getZodTypes();
	expect(mod.ZodZypesInternals.parseColor('rgba(255, 255, 255, 0.5)')).toEqual({
		a: 128,
		r: 255,
		b: 255,
		g: 255,
	});
});
