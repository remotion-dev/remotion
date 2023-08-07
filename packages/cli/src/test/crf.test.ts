import {describe, test} from 'vitest';
import {setCrf} from '../config/crf';
import {expectToThrow} from './expect-to-throw';

describe('set crf invalid input', () => {
	const invalidInputs = [null, 'abc'];
	invalidInputs.forEach((entry) =>
		test(`test for ${entry}`, () =>
			expectToThrow(
				// @ts-expect-error
				() => setCrf(entry),
				/The CRF must be a number or undefined/
			))
	);
});
