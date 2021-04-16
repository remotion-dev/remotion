/* eslint-disable no-console */

import chalk from 'chalk';

const logLevels = ['verbose', 'info', 'warn', 'error'] as const;

export type LogLevel = typeof logLevels[number];

let logLevel: LogLevel = 'info';

export const setLogLevel = (newLogLevel: LogLevel) => {
	logLevel = newLogLevel;
};

const getNumberForLogLevel = (level: LogLevel) => {
	return logLevels.indexOf(level);
};

export const isValidLogLevel = (level: string) => {
	return getNumberForLogLevel(level as LogLevel) >= -1;
};

export const Log = {
	Verbose: (...args: Parameters<typeof console.log>) => {
		if (getNumberForLogLevel(logLevel) <= getNumberForLogLevel('verbose')) {
			return console.log(chalk.blueBright(...args));
		}
	},
	Info: (...args: Parameters<typeof console.log>) => {
		if (getNumberForLogLevel(logLevel) <= getNumberForLogLevel('info')) {
			return console.log(...args);
		}
	},
	Warn: (...args: Parameters<typeof console.log>) => {
		if (getNumberForLogLevel(logLevel) <= getNumberForLogLevel('warn')) {
			return console.log(chalk.yellow(...args));
		}
	},
	Error: (...args: Parameters<typeof console.log>) => {
		if (getNumberForLogLevel(logLevel) <= getNumberForLogLevel('error')) {
			return console.log(chalk.red(...args));
		}
	},
};
