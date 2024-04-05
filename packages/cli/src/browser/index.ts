import type {LogLevel} from '@remotion/renderer';
import {chalk} from '../chalk';
import {Log} from '../log';
import {ENSURE_COMMAND, ensureCommand} from './ensure';

export const BROWSER_COMMAND = 'browser';

const printHelp = (logLevel: LogLevel) => {
	Log.info({indent: false, logLevel});

	Log.info(
		{indent: false, logLevel},
		chalk.blue(`remotion ${BROWSER_COMMAND}`),
	);

	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, 'Available commands:');
	Log.info({indent: false, logLevel}, '');

	Log.info(
		{indent: false, logLevel},
		`remotion ${BROWSER_COMMAND} ${ENSURE_COMMAND}`,
	);
	Log.info(
		{indent: false, logLevel},
		chalk.gray('Ensure Remotion has a browser to render.'),
	);
};

export const browserCommand = (args: string[], logLevel: LogLevel) => {
	if (args[0] === ENSURE_COMMAND) {
		return ensureCommand(logLevel);
	}

	printHelp(logLevel);
};
