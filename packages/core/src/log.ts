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

const transformArgs = (
	args: Parameters<typeof console.log>,
	logLevel: LogLevel,
) => {
	return [Symbol.for(`__remotion_log_${logLevel}`), ...args];
};

const verbose = (
	logLevel: LogLevel,
	...args: Parameters<typeof console.log>
) => {
	if (isEqualOrBelowLogLevel(logLevel, 'verbose')) {
		return console.debug(...transformArgs(args, 'verbose'));
	}
};

const trace = (logLevel: LogLevel, ...args: Parameters<typeof console.log>) => {
	if (isEqualOrBelowLogLevel(logLevel, 'trace')) {
		return console.debug(...transformArgs(args, 'trace'));
	}
};

const info = (logLevel: LogLevel, ...args: Parameters<typeof console.log>) => {
	if (isEqualOrBelowLogLevel(logLevel, 'info')) {
		return console.log(...transformArgs(args, 'info'));
	}
};

const warn = (logLevel: LogLevel, ...args: Parameters<typeof console.log>) => {
	if (isEqualOrBelowLogLevel(logLevel, 'warn')) {
		return console.warn(...transformArgs(args, 'warn'));
	}
};

const error = (...args: Parameters<typeof console.log>) => {
	return console.error(...transformArgs(args, 'error'));
};

export const Log = {
	trace,
	verbose,
	info,
	warn,
	error,
};
