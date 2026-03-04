import {describe, expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {checkForNpmRunFlagPass} from '../check-for-npm-run-flag-pass';
import {getInputProps} from '../get-input-props';
import {parseCommandLineArguments} from '../parsed-cli';
import {studioCommand} from '../studio';
import {expectToThrow} from './expect-to-throw';

describe('programmatic Studio behavior', () => {
	test('checkForNpmRunFlagPass throws in throw mode', () => {
		const previousValue = process.env.npm_config_log;
		process.env.npm_config_log = 'verbose';

		try {
			expectToThrow(
				() =>
					checkForNpmRunFlagPass({
						indent: false,
						logLevel: 'error',
						exitBehavior: 'throw',
					}),
				/npm_config_log/,
			);
		} finally {
			if (typeof previousValue === 'undefined') {
				delete process.env.npm_config_log;
			} else {
				process.env.npm_config_log = previousValue;
			}
		}
	});

	test('getInputProps throws in throw mode for invalid props', () => {
		expectToThrow(
			() =>
				getInputProps(
					null,
					'error',
					parseCommandLineArguments(['--props=invalid-json']),
					'throw',
				),
			/neither valid JSON nor a valid path to a JSON file/,
		);
	});

	test('studioCommand throws in throw mode for missing entrypoint', async () => {
		const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-cli-test-'));

		try {
			let error: Error | null = null;
			try {
				await studioCommand(tmp, [], 'error', {
					commandLine: parseCommandLineArguments([]),
					exitBehavior: 'throw',
				});
			} catch (err) {
				error = err as Error;
			}

			expect(error).not.toBeNull();
			expect((error as Error).message).toContain('No Remotion entrypoint');
		} finally {
			fs.rmSync(tmp, {recursive: true, force: true});
		}
	});
});
