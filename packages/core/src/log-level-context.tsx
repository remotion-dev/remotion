import {createContext} from 'react';
import type {LogLevel} from './log';
import React = require('react');

export type LoggingContextValue = {
	logLevel: LogLevel | null;
	mountTime: number;
};

export const LogLevelContext = createContext<LoggingContextValue>({
	logLevel: 'info',
	mountTime: 0,
});

export const useLogLevel = (): LogLevel => {
	const {logLevel} = React.useContext(LogLevelContext);
	if (logLevel === null) {
		throw new Error('useLogLevel must be used within a LogLevelProvider');
	}

	return logLevel;
};

export const useLogging = (): {
	logLevel: LogLevel;
	mountTime: number;
} => {
	const logging = React.useContext(LogLevelContext);
	if (logging.logLevel === null) {
		throw new Error('useLogging must be used within a LogLevelProvider');
	}

	return {logLevel: logging.logLevel, mountTime: logging.mountTime};
};
