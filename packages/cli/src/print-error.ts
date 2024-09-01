import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {chalk} from './chalk';
import {printCodeFrameAndStack} from './code-frame';
import {Log} from './log';
import {createOverwriteableCliOutput} from './progress-bar';
import {shouldUseNonOverlayingLogger} from './should-use-non-overlaying-logger';

export const printError = async (err: Error, logLevel: LogLevel) => {
	if (err instanceof RenderInternals.SymbolicateableError) {
		const updatesDoOverwrite = !shouldUseNonOverlayingLogger({logLevel});
		const output = createOverwriteableCliOutput({
			quiet: false,
			cancelSignal: null,
			updatesDontOverwrite: !updatesDoOverwrite,
			indent: false,
		});

		if (updatesDoOverwrite) {
			output.update(
				chalk.red('Symbolicating minified error message...\n' + err.message),
				false,
			);
		}

		try {
			const symbolicated = await RenderInternals.symbolicateError(err);
			if (symbolicated.frame !== null && symbolicated.chunk !== null) {
				output.update(
					chalk.red(
						`An error occurred while rendering frame ${err.frame} on chunk ${err.chunk}:`,
					),
					true,
				);
			} else if (symbolicated.frame !== null) {
				output.update(
					chalk.red(`An error occurred while rendering frame ${err.frame}:`),
					true,
				);
			} else if (symbolicated.chunk !== null) {
				output.update(
					chalk.red(`An error occurred on chunk ${err.chunk}:`),
					true,
				);
			} else {
				output.update(chalk.red('An error occurred:'), true);
			}

			printCodeFrameAndStack(symbolicated, logLevel);
			RenderInternals.printUsefulErrorMessage(err, logLevel, false);
		} catch (e) {
			output.update(chalk.red(''), true);
			Log.error({indent: false, logLevel});
			Log.error({indent: false, logLevel}, err.stack || err);
			Log.verbose({indent: false, logLevel}, 'Error symbolicating error');
			Log.verbose({indent: false, logLevel}, e);
		}

		return;
	}

	Log.error({indent: false, logLevel}, err.stack || err);
};
