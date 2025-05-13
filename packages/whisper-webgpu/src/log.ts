/* eslint-disable no-console */
export const logLevels = ['trace', 'verbose', 'info', 'warn', 'error'] as const;

export type LogLevel = (typeof logLevels)[number];

const getNumberForLogLevel = (level: LogLevel) => {
	return logLevels.indexOf(level);
};

export const isEqualOrBelowLogLevel = (
	currentLevel: LogLevel,
	level: LogLevel,
) => {
	return getNumberForLogLevel(currentLevel) <= getNumberForLogLevel(level);
};

export const Log = {
	trace: (logLevel: LogLevel, ...args: Parameters<typeof console.log>) => {
		if (isEqualOrBelowLogLevel(logLevel, 'trace')) {
			return console.log(...args);
		}
	},
	verbose: (logLevel: LogLevel, ...args: Parameters<typeof console.log>) => {
		if (isEqualOrBelowLogLevel(logLevel, 'verbose')) {
			return console.log(...args);
		}
	},
	info: (logLevel: LogLevel, ...args: Parameters<typeof console.log>) => {
		if (isEqualOrBelowLogLevel(logLevel, 'info')) {
			return console.log(...args);
		}
	},
	warn: (logLevel: LogLevel, ...args: Parameters<typeof console.log>) => {
		if (isEqualOrBelowLogLevel(logLevel, 'warn')) {
			return console.warn(...args);
		}
	},
	error: (...args: Parameters<typeof console.log>) => {
		return console.error(...args);
	},
};
