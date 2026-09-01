import {Log, type LogArgs, type LogLevel} from './log.js';
import {playbackLogging} from './playback-logging.js';

export type Logger = {
	trace: (tag: string | null, ...args: LogArgs) => void;
	verbose: (tag: string | null, ...args: LogArgs) => void;
	info: (tag: string | null, ...args: LogArgs) => void;
	warn: (tag: string | null, ...args: LogArgs) => void;
	error: (tag: string | null, ...args: LogArgs) => void;
	playback: (tag: string, message: string) => void;
};

type LoggerOptions = {
	logLevel: LogLevel;
	mountTime: number | null;
};

export const createLoggerFromOptions = (
	getOptions: () => LoggerOptions,
): Logger => {
	return {
		trace: (tag, ...args) =>
			Log.trace({logLevel: getOptions().logLevel, tag}, ...args),
		verbose: (tag, ...args) =>
			Log.verbose({logLevel: getOptions().logLevel, tag}, ...args),
		info: (tag, ...args) =>
			Log.info({logLevel: getOptions().logLevel, tag}, ...args),
		warn: (tag, ...args) =>
			Log.warn({logLevel: getOptions().logLevel, tag}, ...args),
		error: (tag, ...args) =>
			Log.error({logLevel: getOptions().logLevel, tag}, ...args),
		playback: (tag, message) => {
			const {logLevel, mountTime} = getOptions();
			playbackLogging({logLevel, tag, message, mountTime});
		},
	};
};

export const createLogger = (options: LoggerOptions): Logger =>
	createLoggerFromOptions(() => options);
