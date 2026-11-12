import {afterAll, beforeEach, describe, expect, test} from 'bun:test';
import {getInputProps} from '../config/input-props.js';

describe('input props', () => {
	const OLD_ENV = process.env;

	beforeEach(() => {
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
		window.remotion_inputProps = JSON.stringify(inputProps);

		expect(getInputProps()).toEqual(inputProps);
	});

	test('input props in production env', () => {
		process.env.NODE_ENV = 'production';
		window.remotion_inputProps = JSON.stringify({});

		expect(getInputProps()).toEqual({});
	});

	test('input props must be an object', () => {
		process.env.NODE_ENV = 'production';

		window.remotion_inputProps = JSON.stringify([1, 2]);
		expect(() => getInputProps()).toThrow(
			'"inputProps" must be an object, an array was passed',
		);

		window.remotion_inputProps = JSON.stringify(42);
		expect(() => getInputProps()).toThrow(
			'"inputProps" must be an object, but you passed a value of type number',
		);

		window.remotion_inputProps = JSON.stringify({nested: [1, 2]});
		expect(getInputProps()).toEqual({nested: [1, 2]});
	});
});
