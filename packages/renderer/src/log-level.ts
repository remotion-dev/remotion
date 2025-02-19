export const logLevels = ['trace', 'verbose', 'info', 'warn', 'error'] as const;

export type LogLevel = (typeof logLevels)[number];

const getNumberForLogLevel = (level: LogLevel) => {
	return logLevels.indexOf(level);
};

export const isValidLogLevel = (level: string) => {
	return getNumberForLogLevel(level as LogLevel) > -1;
};

export const isEqualOrBelowLogLevel = (
	currentLevel: LogLevel,
	level: LogLevel,
) => {
	return getNumberForLogLevel(currentLevel) <= getNumberForLogLevel(level);
};
