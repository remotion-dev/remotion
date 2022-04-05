import {ErrorWithStackFrame, SymbolicatedStackFrame} from '@remotion/renderer';
import chalk from 'chalk';
import {Internals} from 'remotion';
import {Log} from './log';

const makeFileName = (firstFrame: SymbolicatedStackFrame) => {
	return [
		firstFrame.originalFileName,
		firstFrame.originalLineNumber,
		firstFrame.originalColumnNumber === 0
			? null
			: firstFrame.originalColumnNumber,
	]
		.filter(Internals.truthy)
		.join(':');
};

const printCodeFrame = (frame: SymbolicatedStackFrame) => {
	if (!frame.originalScriptCode) {
		return;
	}
	const longestLineNumber = Math.max(
		...frame.originalScriptCode.map((script) => script.lineNumber)
	).toString().length;
	Log.info(chalk.underline(makeFileName(frame)));
	Log.info();
	Log.info(
		`${frame.originalScriptCode
			.map((c) => {
				const content = `${String(c.lineNumber).padStart(
					longestLineNumber + 1,
					' '
				)} | ${c.content}`;

				return c.highlight ? content : chalk.gray(content);
			})
			.join('\n')}`
	);
};

export const printCodeFrameAndStack = (err: ErrorWithStackFrame) => {
	const firstFrame = err.frames[0];
	printCodeFrame(firstFrame);
	Log.info();
	for (const frame of err.frames) {
		if (frame === firstFrame) {
			continue;
		}
		console.log(`at ${frame.originalFunctionName} (${makeFileName(frame)})`);
	}
};
