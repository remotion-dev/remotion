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
		window.remotion_inputProps = JSON.stringify(JSON.stringify(inputProps));

		expect(getInputProps()).toEqual(
			JSON.stringify(inputProps) as unknown as Record<string, unknown>,
		);
	});

	test('input props in production env', () => {
		process.env.NODE_ENV = 'production';
		window.remotion_inputProps = JSON.stringify({});

		expect(getInputProps()).toEqual({});
	});
});
