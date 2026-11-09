import type {LogLevel} from '@remotion/renderer';
import {chalk} from '../chalk';
import {Log} from '../log';
import {USE_COMMAND, elementsUseCommand} from './use';

export const ELEMENTS_COMMAND = 'elements';

const printHelp = (logLevel: LogLevel) => {
	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		chalk.blue(`remotion ${ELEMENTS_COMMAND}`),
	);
	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, 'Available commands:');
	Log.info({indent: false, logLevel}, '');
	Log.info(
		{indent: false, logLevel},
		`remotion ${ELEMENTS_COMMAND} ${USE_COMMAND} <url>`,
	);
	Log.info(
		{indent: false, logLevel},
		chalk.gray('Install an Element from an Element Library page.'),
	);
};

export const elementsCommand = async ({
	remotionRoot,
	args,
	argv,
	logLevel,
}: {
	remotionRoot: string;
	args: string[];
	argv: string[];
	logLevel: LogLevel;
}) => {
	if (args[0] === USE_COMMAND) {
		await elementsUseCommand({remotionRoot, argv, logLevel});
		return;
	}

	printHelp(logLevel);
};
