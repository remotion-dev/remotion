import {RenderInternals} from '@remotion/renderer';
import {printCodeFrameAndStack} from './code-frame';
import {Log} from './log';

export const printError = async (err: Error) => {
	if (err instanceof RenderInternals.SymbolicateableError) {
		try {
			const symbolicated = await RenderInternals.symbolicateError(err);
			if (symbolicated.frame === null) {
				Log.error('An error occurred:');
			} else {
				Log.error(`An error occurred while rendering frame ${err.frame}:`);
			}

			printCodeFrameAndStack(symbolicated);
		} catch (e) {
			Log.error(
				'(Error occurred symbolicating stack trace - printing minified stack trace)'
			);
			Log.error(err.stack || err);
		}

		return;
	}

	Log.error('An error occurred:');
	Log.error(err.stack || err);
};
