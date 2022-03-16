import {getInputProps} from '../config/input-props';

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
		process.env.NODE_ENV = 'development';
		const inputProps = {
			firstProperty: 'firstProperty',
			secondProperty: 'secondProperty',
		};
		process.env.INPUT_PROPS = JSON.stringify(inputProps);

		expect(getInputProps()).toEqual(JSON.stringify(inputProps));
	});

	test('input props in production env - empty localstorage', () => {
		process.env.NODE_ENV = 'production';
		expect(getInputProps()).toEqual({});
	});
});
