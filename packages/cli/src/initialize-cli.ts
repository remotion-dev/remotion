import path from 'path';
import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ExitBehavior} from './exit-behavior';
import {loadConfig} from './get-config-file-name';
import {makeHyperlink} from './hyperlinks/make-link';
import {Log} from './log';
import {parseCommandLine} from './parse-command-line';
import type {ParsedCommandLine} from './parsed-cli';
import {parsedCli} from './parsed-cli';

export const initializeCli = async (
	remotionRoot: string,
	commandLine: ParsedCommandLine = parsedCli,
	exitBehavior: ExitBehavior = 'process-exit',
): Promise<LogLevel> => {
	const appliedName = await loadConfig(remotionRoot, commandLine, exitBehavior);

	parseCommandLine(commandLine);
	const logLevel = BrowserSafeApis.options.logLevelOption.getValue({
		commandLine,
	}).value;
	// Only now Log.verbose is available
	Log.verbose(
		{indent: false, logLevel},
		'Remotion root directory:',
		makeHyperlink({
			fallback: remotionRoot,
			text: path.relative(process.cwd(), remotionRoot) || '.',
			url: `file://${remotionRoot}`,
		}),
	);
	if (remotionRoot !== process.cwd()) {
		Log.warn(
			{indent: false, logLevel},
			`Warning: The root directory of your project is ${remotionRoot}, but you are executing this command from ${process.cwd()}. The recommendation is to execute commands from the root directory.`,
		);
	}

	if (appliedName) {
		Log.verbose(
			{indent: false, logLevel},
			`Applied configuration from ${makeHyperlink({url: `file://${appliedName}`, text: path.relative(process.cwd(), appliedName), fallback: appliedName})}.`,
		);
	} else {
		Log.verbose({indent: false, logLevel}, 'No config file loaded.');
	}

	return logLevel;
};
