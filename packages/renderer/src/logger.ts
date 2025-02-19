/* eslint-disable no-console */
import {chalk} from './chalk';
import {isColorSupported} from './chalk/is-color-supported';
import type {LogLevel} from './log-level';
import {isEqualOrBelowLogLevel} from './log-level';
import {writeInRepro} from './repro';
import {truthy} from './truthy';

export const INDENT_TOKEN = chalk.gray('│');

export type LogOptions = {
	indent: boolean;
	logLevel: LogLevel;
};

type VerboseLogOptions = LogOptions & {
	tag?: string;
};

export const verboseTag = (str: string) => {
	return isColorSupported() ? chalk.bgBlack(` ${str} `) : `[${str}]`;
};

export const secondverboseTag = (str: string) => {
	return isColorSupported() ? chalk.bgWhite(` ${str} `) : `[${str}]`;
};

export const Log = {
	trace: (
		options: VerboseLogOptions,
		...args: Parameters<typeof console.log>
	) => {
		writeInRepro('trace', ...args);
		if (isEqualOrBelowLogLevel(options.logLevel, 'trace')) {
			if (args.length === 0) {
				// Lambda will print "undefined" otherwise
				return process.stdout.write('\n');
			}

			return console.log(
				...[
					options.indent ? INDENT_TOKEN : null,
					options.tag ? verboseTag(options.tag) : null,
				]
					.filter(truthy)
					.concat(args.map((a) => chalk.gray(a))),
			);
		}
	},
	verbose: (
		options: VerboseLogOptions,
		...args: Parameters<typeof console.log>
	) => {
		writeInRepro('verbose', ...args);
		if (isEqualOrBelowLogLevel(options.logLevel, 'verbose')) {
			if (args.length === 0) {
				// Lambda will print "undefined" otherwise
				return process.stdout.write('\n');
			}

			return console.log(
				...[
					options.indent ? INDENT_TOKEN : null,
					options.tag ? verboseTag(options.tag) : null,
				]
					.filter(truthy)
					.concat(args.map((a) => chalk.gray(a))),
			);
		}
	},
	info: (options: LogOptions, ...args: Parameters<typeof console.log>) => {
		writeInRepro('info', ...args);
		if (isEqualOrBelowLogLevel(options.logLevel, 'info')) {
			if (args.length === 0) {
				// Lambda will print "undefined" otherwise
				return process.stdout.write('\n');
			}

			return console.log(
				...[options.indent ? INDENT_TOKEN : null]
					.filter(truthy)
					.concat(args ?? []),
			);
		}
	},
	warn: (options: LogOptions, ...args: Parameters<typeof console.log>) => {
		writeInRepro('warn', ...args);
		if (isEqualOrBelowLogLevel(options.logLevel, 'warn')) {
			if (args.length === 0) {
				// Lambda will print "undefined" otherwise
				return process.stdout.write('\n');
			}

			return console.warn(
				...[options.indent ? chalk.yellow(INDENT_TOKEN) : null]
					.filter(truthy)
					.concat(args.map((a) => chalk.yellow(a))),
			);
		}
	},
	error: (
		options: VerboseLogOptions,
		...args: Parameters<typeof console.log>
	) => {
		writeInRepro('error', ...args);
		if (isEqualOrBelowLogLevel(options.logLevel, 'error')) {
			if (args.length === 0) {
				// Lambda will print "undefined" otherwise
				return process.stdout.write('\n');
			}

			return console.error(
				...[
					options.indent ? INDENT_TOKEN : null,
					options.tag ? verboseTag(options.tag) : null,
				]
					.filter(truthy)
					.concat(args.map((a) => chalk.red(a))),
			);
		}
	},
};
