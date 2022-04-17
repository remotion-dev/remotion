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

	Log.info();
	const longestLineNumber = Math.max(
		...frame.originalScriptCode.map((script) => script.lineNumber)
	).toString().length;
	Log.info('at', chalk.underline(makeFileName(frame)));
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

const logLine = (frame: SymbolicatedStackFrame) => {
	const fileName = makeFileName(frame);
	if (!fileName) {
		return;
	}

	Log.info(
		chalk.gray(
			['at', frame.originalFunctionName, `${chalk.blueBright(`(${fileName})`)}`]
				.filter(Internals.truthy)
				.join(' ')
		)
	);
};

export const printCodeFrameAndStack = (err: ErrorWithStackFrame) => {
	if (!err.symbolicatedStackFrames) {
		Log.error(err.stack);
		return;
	}

	const firstFrame = err.symbolicatedStackFrames[0];
	Log.error(chalk.bgRed(chalk.white(` ${err.name} `)), err.message);
	printCodeFrame(firstFrame);
	Log.info();
	for (const frame of err.symbolicatedStackFrames) {
		if (frame === firstFrame) {
			continue;
		}

		logLine(frame);
	}

	if (err.delayRenderCall) {
		Log.error();
		Log.error('🕧 The delayRender() call is located at:');
		for (const frame of err.delayRenderCall) {
			const showCodeFrame =
				(!frame.originalFileName?.includes('node_modules') &&
					!frame.originalFileName?.startsWith('webpack/')) ||
				frame === err.delayRenderCall[0] ||
				frame.originalScriptCode
					?.map((c) => c.content)
					.join('')
					.includes('delayRender');

			if (showCodeFrame) {
				printCodeFrame(frame);
			} else {
				logLine(frame);
			}
		}
	}
};
