/* eslint-disable no-console */

import chalk from 'chalk';

export const Log = {
	Verbose: (...args: Parameters<typeof console.log>) => console.log(...args),
	Info: (...args: Parameters<typeof console.log>) => console.log(...args),
	Warn: (...args: Parameters<typeof console.log>) =>
		console.log(chalk.yellow(...args)),
	Error: (...args: Parameters<typeof console.log>) =>
		console.log(chalk.red(...args)),
};
