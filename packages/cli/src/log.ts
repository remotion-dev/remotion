/* eslint-disable no-console */

import chalk from 'chalk';

export enum LogLevel {
	VERBOSE = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

let logLevel = LogLevel.INFO;

export const setLogLevel = (newLogLevel: LogLevel) => {
	logLevel = newLogLevel;
};

export const Log = {
	Verbose: (...args: Parameters<typeof console.log>) => {
		if (logLevel <= LogLevel.VERBOSE) {
			return console.log(chalk.blueBright(...args));
		}
	},
	Info: (...args: Parameters<typeof console.log>) => {
		if (logLevel <= LogLevel.INFO) {
			return console.log(...args);
		}
	},
	Warn: (...args: Parameters<typeof console.log>) => {
		if (logLevel <= LogLevel.WARN) {
			return console.log(chalk.yellow(...args));
		}
	},
	Error: (...args: Parameters<typeof console.log>) => {
		if (logLevel <= LogLevel.ERROR) {
			return console.log(chalk.red(...args));
		}
	},
};
