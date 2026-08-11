import {getRemotionEnvironment} from './get-remotion-environment';

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

const transformArgs = ({
	args,
	logLevel,
	tag,
}: {
	args: Parameters<typeof console.log>;
	logLevel: LogLevel;
	tag: string | null;
}) => {
	const arr = [...args];
	if (
		getRemotionEnvironment().isRendering &&
		!getRemotionEnvironment().isClientSideRendering
	) {
		arr.unshift(Symbol.for(`__remotion_level_${logLevel}`));
	}

	if (
		tag &&
		getRemotionEnvironment().isRendering &&
		!getRemotionEnvironment().isClientSideRendering
	) {
		arr.unshift(Symbol.for(`__remotion_tag_${tag}`));
	}

	return arr;
};

type Options = {
	logLevel: LogLevel;
	tag: string | null;
};

const verbose = (options: Options, ...args: Parameters<typeof console.log>) => {
	if (isEqualOrBelowLogLevel(options.logLevel, 'verbose')) {
		return console.debug(
			...transformArgs({args, logLevel: 'verbose', tag: options.tag}),
		);
	}
};

const trace = (options: Options, ...args: Parameters<typeof console.log>) => {
	if (isEqualOrBelowLogLevel(options.logLevel, 'trace')) {
		return console.debug(
			...transformArgs({args, logLevel: 'trace', tag: options.tag}),
		);
	}
};

const info = (options: Options, ...args: Parameters<typeof console.log>) => {
	if (isEqualOrBelowLogLevel(options.logLevel, 'info')) {
		return console.log(
			...transformArgs({args, logLevel: 'info', tag: options.tag}),
		);
	}
};

const warn = (options: Options, ...args: Parameters<typeof console.log>) => {
	if (isEqualOrBelowLogLevel(options.logLevel, 'warn')) {
		return console.warn(
			...transformArgs({args, logLevel: 'warn', tag: options.tag}),
		);
	}
};

const error = (options: Options, ...args: Parameters<typeof console.log>) => {
	return console.error(
		...transformArgs({args, logLevel: 'error', tag: options.tag}),
	);
};

export const Log = {
	trace,
	verbose,
	info,
	warn,
	error,
};
