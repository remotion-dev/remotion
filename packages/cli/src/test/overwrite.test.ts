import {BrowserSafeApis} from '@remotion/renderer/client';
import {afterEach, beforeAll, expect, test} from 'bun:test';
import {expectToThrow} from './expect-to-throw';

const invalidOverwrite = 555;
let defaultOverwriteValue: boolean;

beforeAll(() => {
	defaultOverwriteValue = BrowserSafeApis.options.overwriteOption.getValue(
		{
			commandLine: {},
		},
		true,
	).value;
});
afterEach(() => {
	BrowserSafeApis.options.overwriteOption.setConfig(defaultOverwriteValue);
});

test('setOverwriteOutput should throw if overwrite is not a boolean value', () => {
	expectToThrow(
		// @ts-expect-error
		() => BrowserSafeApis.options.overwriteOption.setConfig(invalidOverwrite),
		/overwriteExisting must be a boolean but got number [(]555[)]/,
	);
});
test('setOverwriteOutput should NOT throw if image format is a boolean value', () => {
	expect(() =>
		BrowserSafeApis.options.overwriteOption.setConfig(true),
	).not.toThrow();
});
test('getShouldOverwrite should return true by default', () => {
	expect(
		BrowserSafeApis.options.overwriteOption.getValue({commandLine: {}}, true)
			.value,
	).toEqual(true);
});
test('setOverwriteOutput should return a boolean value', () => {
	BrowserSafeApis.options.overwriteOption.setConfig(false);
	expect(
		BrowserSafeApis.options.overwriteOption.getValue({commandLine: {}}, true)
			.value,
	).toEqual(false);
});
