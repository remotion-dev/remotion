/* eslint-disable no-console */

import chalk from 'chalk';
import {Internals} from 'remotion';

export const Log = {
	Verbose: (...args: Parameters<typeof console.log>) => {
		if (Internals.Logging.isEqualOrBelowLogLevel('verbose')) {
			return console.log(chalk.blueBright(...args));
		}
	},
	Info: (...args: Parameters<typeof console.log>) => {
		if (Internals.Logging.isEqualOrBelowLogLevel('info')) {
			return console.log(...args);
		}
	},
	Warn: (...args: Parameters<typeof console.log>) => {
		if (Internals.Logging.isEqualOrBelowLogLevel('warn')) {
			return console.log(chalk.yellow(...args));
		}
	},
	Error: (...args: Parameters<typeof console.log>) => {
		if (Internals.Logging.isEqualOrBelowLogLevel('error')) {
			return console.log(chalk.red(...args));
		}
	},
};
