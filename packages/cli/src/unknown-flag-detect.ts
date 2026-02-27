import type {LogLevel} from '@remotion/renderer';
import {Log} from './log';
import {BooleanFlags, parsedCli} from './parsed-cli';

export const warnAboutUnknownFlag = function (
	allowedFlags: Set<string>,
	logLevel: LogLevel,
	command: string,
) {
	const unknownFlags = Object.keys(parsedCli).filter((key) => {
		if (key === '_') return false;
		if (BooleanFlags.includes(key)) return false;
		return !allowedFlags.has(key);
	});

	for (const flag of unknownFlags) {
		Log.warn(
			{indent: false, logLevel},
			`Unknown flag "--${flag}" for ${command}. Run "remotion render --help" to see valid options.`,
		);
	}
};
