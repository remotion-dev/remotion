/* eslint-disable no-console */
export const logLevels = ['trace', 'verbose', 'info', 'warn', 'error'] as const;

export type MediaParserLogLevel = (typeof logLevels)[number];

const getNumberForLogLevel = (level: MediaParserLogLevel) => {
	return logLevels.indexOf(level);
};

export const isEqualOrBelowLogLevel = (
	currentLevel: MediaParserLogLevel,
	level: MediaParserLogLevel,
) => {
	return getNumberForLogLevel(currentLevel) <= getNumberForLogLevel(level);
};

export const Log = {
	trace: (
		logLevel: MediaParserLogLevel,
		...args: Parameters<typeof console.log>
	) => {
		if (isEqualOrBelowLogLevel(logLevel, 'trace')) {
			return console.log(...args);
		}
	},
	verbose: (
		logLevel: MediaParserLogLevel,
		...args: Parameters<typeof console.log>
	) => {
		if (isEqualOrBelowLogLevel(logLevel, 'verbose')) {
			return console.log(...args);
		}
	},
	info: (
		logLevel: MediaParserLogLevel,
		...args: Parameters<typeof console.log>
	) => {
		if (isEqualOrBelowLogLevel(logLevel, 'info')) {
			return console.log(...args);
		}
	},
	warn: (
		logLevel: MediaParserLogLevel,
		...args: Parameters<typeof console.log>
	) => {
		if (isEqualOrBelowLogLevel(logLevel, 'warn')) {
			return console.warn(...args);
		}
	},
	error: (...args: Parameters<typeof console.log>) => {
		return console.error(...args);
	},
};
