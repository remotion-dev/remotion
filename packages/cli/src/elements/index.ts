import type {LogLevel} from '@remotion/renderer';
import {chalk} from '../chalk';
import {Log} from '../log';
import {ADD_LIBRARY_COMMAND, elementsAddLibraryCommand} from './add-library';
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
	Log.info({indent: false, logLevel}, '');
	Log.info(
		{indent: false, logLevel},
		`remotion ${ELEMENTS_COMMAND} ${ADD_LIBRARY_COMMAND} <url>`,
	);
	Log.info(
		{indent: false, logLevel},
		chalk.gray('Add an Element Library to the Remotion config file.'),
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

	if (args[0] === ADD_LIBRARY_COMMAND) {
		await elementsAddLibraryCommand({remotionRoot, argv, logLevel});
		return;
	}

	if (args[0] !== undefined) {
		Log.error(
			{indent: false, logLevel},
			`Command ${ELEMENTS_COMMAND} ${args[0]} not found.`,
		);
		printHelp(logLevel);
		process.exit(1);
	}

	printHelp(logLevel);
};
