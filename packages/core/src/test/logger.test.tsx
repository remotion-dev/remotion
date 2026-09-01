import {
	afterEach,
	describe,
	expect,
	restoreAllMocks,
	spyOn,
	test,
} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import type React from 'react';
import {useEffect} from 'react';
import {LogLevelContext} from '../log-level-context.js';
import type {Logger} from '../logger.js';
import {useLogger} from '../use-logger.js';

afterEach(() => {
	cleanup();
	restoreAllMocks();
});

const LoggerProbe: React.FC<{
	onLogger: (logger: Logger) => void;
}> = ({onLogger}) => {
	const logger = useLogger();

	useEffect(() => {
		onLogger(logger);
	}, [logger, onLogger]);

	return null;
};

describe('useLogger()', () => {
	test('keeps loggers isolated between roots', () => {
		const debug = spyOn(console, 'debug').mockImplementation(() => undefined);
		let traceLogger!: Logger;
		let errorLogger!: Logger;

		render(
			<>
				<LogLevelContext.Provider value={{logLevel: 'trace', mountTime: 0}}>
					<LoggerProbe onLogger={(logger) => (traceLogger = logger)} />
				</LogLevelContext.Provider>
				<LogLevelContext.Provider value={{logLevel: 'error', mountTime: 0}}>
					<LoggerProbe onLogger={(logger) => (errorLogger = logger)} />
				</LogLevelContext.Provider>
			</>,
		);

		traceLogger.trace(null, 'visible');
		errorLogger.trace(null, 'hidden');

		expect(debug).toHaveBeenCalledTimes(1);
		expect(debug.mock.calls[0]?.at(-1)).toBe('visible');
	});

	test('keeps its identity while reading the latest level', () => {
		const debug = spyOn(console, 'debug').mockImplementation(() => undefined);
		let logger!: Logger;
		const onLogger = (newLogger: Logger) => {
			logger = newLogger;
		};

		const result = render(
			<LogLevelContext.Provider value={{logLevel: 'trace', mountTime: 0}}>
				<LoggerProbe onLogger={onLogger} />
			</LogLevelContext.Provider>,
		);
		const initialLogger = logger;

		logger.trace(null, 'visible');
		result.rerender(
			<LogLevelContext.Provider value={{logLevel: 'error', mountTime: 0}}>
				<LoggerProbe onLogger={onLogger} />
			</LogLevelContext.Provider>,
		);
		logger.trace(null, 'hidden');

		expect(logger).toBe(initialLogger);
		expect(debug).toHaveBeenCalledTimes(1);
	});
});
