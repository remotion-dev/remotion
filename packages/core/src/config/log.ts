export const logLevels = ['verbose', 'info', 'warn', 'error'] as const;

export type LogLevel = typeof logLevels[number];

let logLevel: LogLevel = 'info';

export const getLogLevel = () => {
	return logLevel;
};

export const setLogLevel = (newLogLevel: LogLevel) => {
	logLevel = newLogLevel;
};

const getNumberForLogLevel = (level: LogLevel) => {
	return logLevels.indexOf(level);
};

export const isValidLogLevel = (level: string) => {
	return getNumberForLogLevel(level as LogLevel) >= -1;
};

export const isEqualOrBelowLogLevel = (level: LogLevel) => {
	return getNumberForLogLevel(logLevel) <= getNumberForLogLevel(level);
};
