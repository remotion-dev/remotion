import type {LogLevel, LogOptions} from '@remotion/renderer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Log} from './log';
import {parsedCli} from './parsed-cli';

export const getInputProps = (
	onUpdate: ((newProps: Record<string, unknown>) => void) | null,
	logLevel: LogLevel,
): Record<string, unknown> => {
	if (!parsedCli.props) {
		return {};
	}

	const jsonFile = path.resolve(process.cwd(), parsedCli.props);
	try {
		if (fs.existsSync(jsonFile)) {
			const rawJsonData = fs.readFileSync(jsonFile, 'utf-8');

			if (onUpdate) {
				fs.watchFile(jsonFile, {interval: 100}, () => {
					try {
						onUpdate(JSON.parse(fs.readFileSync(jsonFile, 'utf-8')));
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

			return JSON.parse(rawJsonData);
		}

		return JSON.parse(parsedCli.props);
	} catch {
		Log.error(
			{indent: false, logLevel},
			'You passed --props but it was neither valid JSON nor a file path to a valid JSON file. Provided value: ' +
				parsedCli.props,
		);
		Log.info(
			{indent: false, logLevel},
			'Got the following value:',
			parsedCli.props,
		);
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
};
