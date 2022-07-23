export const logLevels = ['verbose', 'info', 'warn', 'error'] as const;

export type LogLevel = typeof logLevels[number];

export const DEFAULT_LOG_LEVEL: LogLevel = 'info';

let logLevel: LogLevel = DEFAULT_LOG_LEVEL;

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
	return getNumberForLogLevel(level as LogLevel) > -1;
};

export const isEqualOrBelowLogLevel = (
	currentLevel: LogLevel,
	level: LogLevel
) => {
	return getNumberForLogLevel(currentLevel) <= getNumberForLogLevel(level);
};
