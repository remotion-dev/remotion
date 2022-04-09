import {ErrorWithStackFrame} from '@remotion/renderer';
import {printCodeFrameAndStack} from './code-frame';
import {Log} from './log';

export const printError = (err: Error) => {
	if (err instanceof ErrorWithStackFrame) {
		if (err.frame === null) {
			Log.error('An error occurred:');
		} else {
			Log.error(`An error occurred while rendering frame ${err.frame}:`);
		}

		printCodeFrameAndStack(err);
		return;
	}

	Log.error('An error occurred:');
	Log.error(err.stack || err);
};
