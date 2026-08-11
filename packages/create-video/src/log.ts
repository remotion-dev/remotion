/* eslint-disable no-console */

import chalk from 'chalk';

export const Log = {
	chalk,
	verbose: (...args: Parameters<typeof console.log>) => {
		return console.log(chalk.blue(...args));
	},
	info: (...args: Parameters<typeof console.log>) => {
		return console.log(...args);
	},
	warn: (...args: Parameters<typeof console.log>) => {
		return console.warn(chalk.yellow(...args));
	},
	error: (...args: Parameters<typeof console.log>) => {
		return console.error(chalk.red(...args));
	},
	newLine: () => {
		return console.log();
	},
};
