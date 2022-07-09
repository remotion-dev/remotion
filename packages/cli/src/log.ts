/* eslint-disable no-console */

import {Internals} from 'remotion';
import {chalk} from './chalk';

export const Log = {
	verbose: (...args: Parameters<typeof console.log>) => {
		if (
			Internals.Logging.isEqualOrBelowLogLevel(
				Internals.Logging.getLogLevel(),
				'verbose'
			)
		) {
			return console.log(...args.map((a) => chalk.blueBright(a)));
		}
	},
	info: (...args: Parameters<typeof console.log>) => {
		if (
			Internals.Logging.isEqualOrBelowLogLevel(
				Internals.Logging.getLogLevel(),
				'info'
			)
		) {
			return console.log(...args);
		}
	},
	warn: (...args: Parameters<typeof console.log>) => {
		if (
			Internals.Logging.isEqualOrBelowLogLevel(
				Internals.Logging.getLogLevel(),
				'warn'
			)
		) {
			return console.warn(...args.map((a) => chalk.yellow(a)));
		}
	},
	error: (...args: Parameters<typeof console.log>) => {
		if (
			Internals.Logging.isEqualOrBelowLogLevel(
				Internals.Logging.getLogLevel(),
				'error'
			)
		) {
			return console.error(...args.map((a) => chalk.red(a)));
		}
	},
};
