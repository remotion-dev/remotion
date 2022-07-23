/* eslint-disable no-console */
import {RenderInternals} from '@remotion/renderer';
import {chalk} from './chalk';
import {ConfigInternals} from './config';

export const Log = {
	verbose: (...args: Parameters<typeof console.log>) => {
		if (
			RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'verbose'
			)
		) {
			return console.log(...args.map((a) => chalk.blueBright(a)));
		}
	},
	info: (...args: Parameters<typeof console.log>) => {
		if (
			RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'info'
			)
		) {
			return console.log(...args);
		}
	},
	warn: (...args: Parameters<typeof console.log>) => {
		if (
			RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'warn'
			)
		) {
			return console.warn(...args.map((a) => chalk.yellow(a)));
		}
	},
	error: (...args: Parameters<typeof console.log>) => {
		if (
			RenderInternals.isEqualOrBelowLogLevel(
				ConfigInternals.Logging.getLogLevel(),
				'error'
			)
		) {
			return console.error(...args.map((a) => chalk.red(a)));
		}
	},
};
