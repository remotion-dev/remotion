import type {
	ErrorWithStackFrame,
	LogLevel,
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

const printCodeFrame = (frame: SymbolicatedStackFrame, logLevel: LogLevel) => {
	if (!frame.originalScriptCode) {
		return;
	}

	Log.info({indent: false, logLevel});
	const longestLineNumber = Math.max(
		...frame.originalScriptCode.map((script) => script.lineNumber),
	).toString().length;
	Log.info(
		{indent: false, logLevel},
		'at',
		chalk.underline(makeFileName(frame)),
	);
	const alignLeftAmount = Math.min(
		...frame.originalScriptCode.map(
			(c) => c.content.length - c.content.trimStart().length,
		),
	);

	Log.info(
		{indent: false, logLevel},
		`${frame.originalScriptCode
			.map((c) => {
				const left = String(c.lineNumber).padStart(longestLineNumber, ' ');
				const right = c.content.substring(alignLeftAmount);
				if (c.highlight) {
					return `${left} │ ${right}`;
				}

				return `${chalk.gray(left)} │ ${chalk.gray(right)}`;
			})
			.join('\n')}`,
	);
};

const logLine = (frame: SymbolicatedStackFrame, logLevel: LogLevel) => {
	const fileName = makeFileName(frame);
	if (!fileName) {
		return;
	}

	Log.info(
		{indent: false, logLevel},
		chalk.gray(
			['at', frame.originalFunctionName, `${chalk.blueBright(`(${fileName})`)}`]
				.filter(truthy)
				.join(' '),
		),
	);
};

export const printCodeFrameAndStack = ({
	symbolicated,
	logLevel,
}: {
	symbolicated: ErrorWithStackFrame;
	logLevel: LogLevel;
}) => {
	if (
		!symbolicated.symbolicatedStackFrames ||
		symbolicated.symbolicatedStackFrames.length === 0
	) {
		Log.error({indent: false, logLevel}, symbolicated.stack);
		return;
	}

	const firstFrame = symbolicated.symbolicatedStackFrames[0];
	Log.error(
		{indent: false, logLevel},
		chalk.bgRed(chalk.white(` ${symbolicated.name} `)),
		symbolicated.message,
	);
	printCodeFrame(firstFrame as SymbolicatedStackFrame, logLevel);
	Log.info({indent: false, logLevel});
	for (const frame of symbolicated.symbolicatedStackFrames) {
		if (frame === firstFrame) {
			continue;
		}

		const isUserCode =
			!frame.originalFileName?.includes('node_modules') &&
			!frame.originalFileName?.startsWith('webpack/');
		if (isUserCode) {
			printCodeFrame(frame, logLevel);
		} else {
			logLine(frame, logLevel);
		}
	}

	if (symbolicated.delayRenderCall) {
		Log.error({indent: false, logLevel});
		Log.error(
			{indent: false, logLevel},
			'🕧 The delayRender() call is located at:',
		);
		for (const frame of symbolicated.delayRenderCall) {
			const showCodeFrame =
				(!frame.originalFileName?.includes('node_modules') &&
					!frame.originalFileName?.startsWith('webpack/')) ||
				frame === symbolicated.delayRenderCall[0] ||
				frame.originalScriptCode
					?.map((c) => c.content)
					.join('')
					.includes('delayRender');

			if (showCodeFrame) {
				printCodeFrame(frame, logLevel);
			} else {
				logLine(frame, logLevel);
			}
		}
	}
};
