import type {LogLevel} from '@remotion/renderer';
import {ConfigInternals} from './config';
import {loadConfig} from './get-config-file-name';
import {Log} from './log';
import {parseCommandLine} from './parse-command-line';

export const initializeCli = async (
	remotionRoot: string,
): Promise<LogLevel> => {
	const appliedName = await loadConfig(remotionRoot);

	parseCommandLine();
	const logLevel = ConfigInternals.Logging.getLogLevel();
	// Only now Log.verbose is available
	Log.verboseAdvanced(
		{indent: false, logLevel},
		'Remotion root directory:',
		remotionRoot,
	);
	if (remotionRoot !== process.cwd()) {
		Log.warn(
			`Warning: The root directory of your project is ${remotionRoot}, but you are executing this command from ${process.cwd()}. The recommendation is to execute commands from the root directory.`,
		);
	}

	if (appliedName) {
		Log.verboseAdvanced(
			{indent: false, logLevel},
			`Applied configuration from ${appliedName}.`,
		);
	} else {
		Log.verboseAdvanced({indent: false, logLevel}, 'No config file loaded.');
	}

	return logLevel;
};
