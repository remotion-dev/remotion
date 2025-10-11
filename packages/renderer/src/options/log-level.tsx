import type {LogLevel} from '../log-level';
import {isValidLogLevel, logLevels} from '../log-level';
import type {AnyRemotionOption} from './option';

let logLevel: LogLevel = 'info';

const cliFlag = 'log' as const;

export const logLevelOption = {
	cliFlag,
	name: 'Log Level',
	ssrName: 'logLevel',
	description: () => (
		<>
			One of <code>trace</code>, <code>verbose</code>, <code>info</code>,{' '}
			<code>warn</code>, <code>error</code>.<br /> Determines how much info is
			being logged to the console.
			<br />
			<br /> Default <code>info</code>.
		</>
	),
	docLink: 'https://www.remotion.dev/docs/troubleshooting/debug-failed-render',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			if (!isValidLogLevel(commandLine[cliFlag] as string)) {
				throw new Error(
					`Invalid \`--log\` value passed. Accepted values: ${logLevels
						.map((l) => `'${l}'`)
						.join(', ')}.`,
				);
			}

			return {value: commandLine[cliFlag] as LogLevel, source: 'cli'};
		}

		if (logLevel !== 'info') {
			return {value: logLevel, source: 'config'};
		}

		return {value: 'info', source: 'default'};
	},
	setConfig: (newLogLevel: LogLevel) => {
		logLevel = newLogLevel;
	},
	type: 'error' as LogLevel,
} satisfies AnyRemotionOption<LogLevel>;
