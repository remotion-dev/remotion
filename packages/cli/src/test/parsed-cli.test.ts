import {describe, expect, test} from 'bun:test';
import {parseCommandLine} from '../parse-command-line';
import {parseCommandLineArguments} from '../parsed-cli';
import {expectToThrow} from './expect-to-throw';

describe('parseCommandLineArguments()', () => {
	test('applies default values consistently', () => {
		const parsed = parseCommandLineArguments([]);
		expect(parsed.overwrite).toBe(true);
		expect(parsed.muted).toBeNull();
	});

	test('parses positional args and studio flags', () => {
		const parsed = parseCommandLineArguments([
			'src/index.ts',
			'--port=4321',
			'--force-new',
			'--browser-args=--incognito',
		]);

		expect(parsed._).toEqual(['src/index.ts']);
		expect(parsed.port).toBe(4321);
		expect(parsed['force-new']).toBe(true);
		expect(parsed['browser-args']).toBe('--incognito');
	});
});

describe('parseCommandLine()', () => {
	test('validates custom command line input', () => {
		expectToThrow(
			() => parseCommandLine(parseCommandLineArguments(['--png'])),
			/The --png flag has been removed/,
		);
	});
});
