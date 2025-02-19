import {BrowserSafeApis} from '@remotion/renderer/client';
import {describe, test} from 'bun:test';
import {expectToThrow} from './expect-to-throw';

describe('set crf invalid input', () => {
	const invalidInputs = [null, 'abc'];
	invalidInputs.forEach((entry) =>
		test(`test for ${entry}`, () =>
			expectToThrow(
				// @ts-expect-error
				() => BrowserSafeApis.options.crfOption.setConfig(entry),
				/The CRF must be a number or undefined/,
			)),
	);
});
