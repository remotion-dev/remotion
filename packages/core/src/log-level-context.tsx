import {createContext} from 'react';
import type {LogLevel} from './log';
import React = require('react');

export const LogLevelContext = createContext<LogLevel | null>('info');

export const useLogLevel = (): LogLevel => {
	const logLevel = React.useContext(LogLevelContext);
	if (logLevel === null) {
		throw new Error('useLogLevel must be used within a LogLevelProvider');
	}

	return logLevel;
};
