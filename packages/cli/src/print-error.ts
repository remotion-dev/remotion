import {RenderInternals} from '@remotion/renderer';
import {chalk} from './chalk';
import {printCodeFrameAndStack} from './code-frame';
import {Log} from './log';
import {createOverwriteableCliOutput} from './progress-bar';

export const printError = async (err: Error) => {
	if (err instanceof RenderInternals.SymbolicateableError) {
		const output = createOverwriteableCliOutput(false);
		output.update(
			chalk.red('Symbolicating minified error message...\n' + err.message)
		);
		try {
			const symbolicated = await RenderInternals.symbolicateError(err);
			if (symbolicated.frame === null) {
				output.update(chalk.red('An error occurred:\n'));
			} else {
				output.update(
					chalk.red(`An error occurred while rendering frame ${err.frame}:\n`)
				);
			}

			printCodeFrameAndStack(symbolicated);
		} catch (e) {
			output.update(
				chalk.red(
					'(Error occurred symbolicating stack trace - printing minified stack trace)\n'
				)
			);
			Log.error();
			Log.error(err.stack || err);
		}

		return;
	}

	Log.error('An error occurred:');
	Log.error(err.stack || err);
};
