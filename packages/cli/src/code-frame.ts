import type {
	ErrorWithStackFrame,
	SymbolicatedStackFrame,
} from '@remotion/renderer';
import {chalk} from './chalk';
import {Log} from './log';
import {truthy} from './truthy';

const makeFileName = (firstFrame: SymbolicatedStackFrame) => {
	return [
		firstFrame.originalFileName,
		firstFrame.originalLineNumber,
		firstFrame.originalColumnNumber === 0
			? null
			: firstFrame.originalColumnNumber,
	]
		.filter(truthy)
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
	const alignLeftAmount = Math.min(
		...frame.originalScriptCode.map(
			(c) => c.content.length - c.content.trimStart().length
		)
	);

	Log.info(
		`${frame.originalScriptCode
			.map((c) => {
				const content = `${String(c.lineNumber).padStart(
					longestLineNumber,
					' '
				)} | ${c.content.substring(alignLeftAmount)}`;

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
				.filter(truthy)
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
