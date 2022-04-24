/* eslint-disable no-console */

import chalk from 'chalk';
import {Internals} from 'remotion';

export const Log = {
	verbose: (...args: Parameters<typeof console.log>) => {
		if (
			Internals.Logging.isEqualOrBelowLogLevel(
				Internals.Logging.getLogLevel(),
				'verbose'
			)
		) {
			return console.log(chalk.blueBright(...args));
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
			return console.warn(chalk.yellow(...args));
		}
	},
	error: (...args: Parameters<typeof console.log>) => {
		if (
			Internals.Logging.isEqualOrBelowLogLevel(
				Internals.Logging.getLogLevel(),
				'error'
			)
		) {
			return console.error(chalk.red(...args));
		}
	},
};
