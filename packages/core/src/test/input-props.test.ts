import {getInputProps, INPUT_PROPS_KEY} from '../config/input-props';

describe('input props', () => {
	const OLD_ENV = process.env;

	beforeEach(() => {
		jest.resetModules(); // Most important - it clears the cache
		process.env = {...OLD_ENV}; // Make a copy
	});

	afterAll(() => {
		process.env = OLD_ENV; // Restore old environment
	});

	test('input props in non production env', () => {
		process.env.NODE_ENV = 'dev';
		const inputProps = {
			firstProperty: 'firstProperty',
			secondProperty: 'secondProperty',
		};
		process.env.INPUT_PROPS = JSON.stringify(inputProps);

		expect(getInputProps()).toEqual(JSON.stringify(inputProps));
	});

	test('input props in production env', () => {
		process.env.NODE_ENV = 'production';
		const inputProps = {
			firstProperty: 'firstProperty',
			secondProperty: 'secondProperty',
		};
		const previousInputProps = localStorage.getItem(INPUT_PROPS_KEY);
		localStorage.setItem(INPUT_PROPS_KEY, JSON.stringify(inputProps));

		expect(getInputProps()).toEqual(inputProps);

		if (previousInputProps) {
			localStorage.setItem(INPUT_PROPS_KEY, previousInputProps);
		} else {
			localStorage.removeItem(INPUT_PROPS_KEY);
		}
	});

	test('input props in production env - empty localstorage', () => {
		process.env.NODE_ENV = 'production';
		expect(getInputProps()).toEqual({});
	});
});
