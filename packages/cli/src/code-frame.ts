import type {
	ErrorWithStackFrame,
	LogLevel,
	SymbolicatedStackFrame,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {chalk} from './chalk';
import {Log} from './log';

const printCodeFrame = (frame: SymbolicatedStackFrame, logLevel: LogLevel) => {
	const codeFrame = RenderInternals.formatStackFrameCodeFrame(frame);
	if (codeFrame === null) {
		return;
	}

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		'at',
		chalk.underline(RenderInternals.makeStackFrameFileName(frame)),
	);
	Log.info({indent: false, logLevel}, codeFrame);
};

const logLine = (frame: SymbolicatedStackFrame, logLevel: LogLevel) => {
	const line = RenderInternals.formatStackFrameLocationLine(frame);
	if (line === null) {
		return;
	}

	Log.info({indent: false, logLevel}, line);
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
