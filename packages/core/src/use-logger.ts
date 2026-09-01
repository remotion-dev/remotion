import {useContext, useRef} from 'react';
import {
	LogLevelContext,
	type LoggingContextValue,
} from './log-level-context.js';
import {createLoggerFromOptions, type Logger} from './logger.js';

export const useLogger = (): Logger => {
	const logging = useContext(LogLevelContext);
	if (logging.logLevel === null) {
		throw new Error('useLogger must be used within a LogLevelProvider');
	}

	const loggingRef = useRef<LoggingContextValue>(logging);
	loggingRef.current = logging;
	const loggerRef = useRef<Logger | null>(null);

	if (loggerRef.current === null) {
		loggerRef.current = createLoggerFromOptions(() => {
			const {logLevel, mountTime} = loggingRef.current;
			if (logLevel === null) {
				throw new Error('useLogger must be used within a LogLevelProvider');
			}

			return {logLevel, mountTime};
		});
	}

	return loggerRef.current;
};
