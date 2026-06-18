import {expect, test} from 'bun:test';
import {createEffect} from '../effects/create-effect.js';

type RequiredParams = {
	readonly value: number;
};

const makeEffectWithValidation = () =>
	createEffect<RequiredParams, null>({
		type: 'dev.remotion.test.required',
		label: 'Required',
		documentationLink: null,
		backend: '2d',
		calculateKey: (p) => `required-${p.value}`,
		setup: () => null,
		apply: () => undefined,
		cleanup: () => undefined,
		schema: {
			value: {
				type: 'number',
				default: undefined,
				description: 'Value',
				hiddenFromList: false,
			},
		},
		validateParams: (params) => {
			if (typeof params.value !== 'number' || !Number.isFinite(params.value)) {
				throw new TypeError(
					`"value" must be a finite number, but got ${JSON.stringify(params.value)}`,
				);
			}
		},
	});

test('createEffect calls validateParams when the factory is invoked', () => {
	const effect = makeEffectWithValidation();
	expect(() => effect({} as RequiredParams)).toThrow(
		'"value" must be a finite number, but got undefined',
	);
	expect(() => effect({value: 1})).not.toThrow();
});
