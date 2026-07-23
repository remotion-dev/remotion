import {RenderInternals} from '@remotion/renderer';
import type {
	LogStudioErrorRequest,
	LogStudioErrorResponse,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';

const {chalk, isColorSupported} = RenderInternals;

const coerceString = (value: unknown) => {
	return typeof value === 'string' && value.length > 0 ? value : null;
};

const formatFrame = (frame: SymbolicatedStackFrame) => {
	const codeFrame = RenderInternals.formatStackFrameCodeFrame(frame);
	if (codeFrame !== null) {
		const fileName = RenderInternals.makeStackFrameFileName(frame);
		const header = fileName ? `at ${chalk.underline(fileName)}` : 'at';
		return `${header}\n${codeFrame}`;
	}

	return RenderInternals.formatStackFrameLocationLine(frame);
};

const formatSymbolicatedStack = (
	name: string | null,
	message: string,
	frames: SymbolicatedStackFrame[],
) => {
	const label = name ?? 'Error';
	const firstLine = isColorSupported()
		? `${chalk.bgRed(chalk.white(` ${label} `))} ${message}`
		: `${label}: ${message}`;
	const lines: string[] = [firstLine];

	for (const frame of frames) {
		const formatted = formatFrame(frame);
		if (formatted === null) {
			continue;
		}

		lines.push('');
		lines.push(formatted);
	}

	return lines.join('\n');
};

export const logStudioErrorHandler: ApiHandler<
	LogStudioErrorRequest,
	LogStudioErrorResponse
> = ({input, logLevel}) => {
	const name = coerceString(input.name);
	const message = coerceString(input.message) ?? 'Unknown Studio error';

	const symbolicatedStackFrames =
		input.symbolicatedStackFrames && input.symbolicatedStackFrames.length > 0
			? input.symbolicatedStackFrames
			: null;

	let output: string;
	if (symbolicatedStackFrames) {
		output = formatSymbolicatedStack(name, message, symbolicatedStackFrames);
	} else {
		const stack = coerceString(input.stack);
		const headline = name ? `${name}: ${message}` : message;
		output = stack
			? stack.startsWith(headline)
				? stack
				: `${headline}\n${stack}`
			: headline;
	}

	RenderInternals.Log.error(
		{indent: false, logLevel},
		chalk.red('An error occurred in the Studio:'),
	);
	RenderInternals.Log.error({indent: false, logLevel}, output);

	return Promise.resolve({});
};
