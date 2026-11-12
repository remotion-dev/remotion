import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {LogLevel, LogOptions} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {Log} from './log';
import {parsedCli} from './parsed-cli';

const {propsOption} = BrowserSafeApis.options;

export const getInputProps = (
	onUpdate: ((newProps: Record<string, unknown>) => void) | null,
	logLevel: LogLevel,
): Record<string, unknown> => {
	const rawProps = propsOption.getValue({commandLine: parsedCli}).value;
	if (rawProps === null) {
		return {};
	}

	// minimist parses e.g. --props=123 as a number
	const props = String(rawProps);

	const jsonFile = path.resolve(process.cwd(), props);
	let parsed: unknown;
	try {
		if (fs.existsSync(jsonFile)) {
			// Windows PowerShell 5.1 and some editors save UTF-8 with a BOM,
			// which JSON.parse() rejects.
			const rawJsonData = fs
				.readFileSync(jsonFile, 'utf-8')
				.replace(/^\uFEFF/, '');

			if (onUpdate) {
				fs.watchFile(jsonFile, {interval: 100}, () => {
					try {
						const newProps: unknown = JSON.parse(
							fs.readFileSync(jsonFile, 'utf-8').replace(/^\uFEFF/, ''),
						);
						if (
							typeof newProps !== 'object' ||
							newProps === null ||
							Array.isArray(newProps)
						) {
							Log.error(
								{indent: false, logLevel},
								`${jsonFile} must contain a JSON object. Did not apply new input props.`,
							);
							return;
						}

						onUpdate(newProps as Record<string, unknown>);
						Log.info(
							{indent: false, logLevel},
							`Updated input props from ${jsonFile}.`,
						);
					} catch {
						Log.error(
							{indent: false, logLevel},
							`${jsonFile} contains invalid JSON. Did not apply new input props.`,
						);
					}
				});
			}

			parsed = JSON.parse(rawJsonData);
		} else {
			parsed = JSON.parse(props);
		}
	} catch {
		Log.error(
			{indent: false, logLevel},
			'You passed --props but it was neither valid JSON nor a file path to a valid JSON file. Provided value: ' +
				props,
		);
		Log.info({indent: false, logLevel}, 'Got the following value:', props);
		Log.error(
			{indent: false, logLevel},
			'Check that your input is parseable using `JSON.parse` and try again.',
		);
		if (os.platform() === 'win32') {
			const logOptions: LogOptions = {
				indent: false,
				logLevel,
			};
			Log.warn(
				logOptions,
				'Note: Windows handles escaping of quotes very weirdly in the command line.',
			);
			Log.warn(logOptions, 'This might have led to you having this problem.');
			Log.warn(
				logOptions,
				'Consider using the alternative API for --props which is to pass',
			);
			Log.warn(logOptions, 'a path to a JSON file:');
			Log.warn(logOptions, '  --props=path/to/props.json');
		}

		process.exit(1);
	}

	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		Log.error(
			{indent: false, logLevel},
			`--props must be a JSON object, but got ${
				Array.isArray(parsed) ? 'an array' : JSON.stringify(parsed)
			}. Wrap the data in an object, for example {"items": [...]}.`,
		);
		process.exit(1);
	}

	return parsed as Record<string, unknown>;
};
