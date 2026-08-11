import {expect, test} from 'bun:test';
import {darkModeOption} from '../options/dark-mode';

test('dark mode option respects config if CLI flag is absent', () => {
	darkModeOption.setConfig(true);
	expect(
		darkModeOption.getValue({
			commandLine: {'dark-mode': null},
		}).value,
	).toEqual(true);
	expect(
		darkModeOption.getValue({
			commandLine: {'dark-mode': false},
		}).value,
	).toEqual(false);
	darkModeOption.setConfig(false);
});
