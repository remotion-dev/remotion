import type {LogLevel} from '@remotion/renderer';

let logLevel: LogLevel = 'info';

export const getLogLevel = () => {
	return logLevel;
};

export const setLogLevel = (newLogLevel: LogLevel) => {
	logLevel = newLogLevel;
};
