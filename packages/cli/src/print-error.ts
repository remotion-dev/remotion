import {ErrorWithStackFrame} from '@remotion/renderer';
import {printCodeFrameAndStack} from './code-frame';
import {Log} from './log';

export const printError = (err: Error) => {
	if (err instanceof ErrorWithStackFrame) {
		printCodeFrameAndStack(err);
		return;
	}
	Log.error(err.stack);
};
