/**
 * @vitest-environment jsdom
 */
import {afterAll, beforeEach, describe, expect, test, vitest} from 'vitest';
import {getInputProps} from '../config/input-props';

describe('input props', () => {
	const OLD_ENV = process.env;

	beforeEach(() => {
		vitest.resetModules(); // Most important - it clears the cache
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
		window.remotion_inputProps = JSON.stringify(JSON.stringify(inputProps));

		expect(getInputProps()).toEqual(JSON.stringify(inputProps));
	});

	test('input props in production env', () => {
		process.env.NODE_ENV = 'production';
		window.remotion_inputProps = JSON.stringify({});

		expect(getInputProps()).toEqual({});
	});
});
