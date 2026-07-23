import {chalk} from '../chalk';
import type {SymbolicatedStackFrame} from '../symbolicate-stacktrace';
import {truthy} from '../truthy';

export const makeStackFrameFileName = (
	frame: SymbolicatedStackFrame,
): string => {
	return [
		frame.originalFileName,
		frame.originalLineNumber,
		frame.originalColumnNumber === 0 ? null : frame.originalColumnNumber,
	]
		.filter(truthy)
		.join(':');
};

// Returns the rendered code frame body (line numbers + gutter), or null if the
// frame has no associated original script code.
export const formatStackFrameCodeFrame = (
	frame: SymbolicatedStackFrame,
): string | null => {
	if (!frame.originalScriptCode || frame.originalScriptCode.length === 0) {
		return null;
	}

	const longestLineNumber = Math.max(
		...frame.originalScriptCode.map((script) => script.lineNumber),
	).toString().length;
	const alignLeftAmount = Math.min(
		...frame.originalScriptCode.map(
			(c) => c.content.length - c.content.trimStart().length,
		),
	);

	return frame.originalScriptCode
		.map((c) => {
			const left = String(c.lineNumber).padStart(longestLineNumber, ' ');
			const right = c.content.substring(alignLeftAmount);
			if (c.highlight) {
				return `${left} │ ${right}`;
			}

			return `${chalk.gray(left)} │ ${chalk.gray(right)}`;
		})
		.join('\n');
};

// Returns a single gray "at functionName (fileName)" line, or null if there is
// no file location for the frame.
export const formatStackFrameLocationLine = (
	frame: SymbolicatedStackFrame,
): string | null => {
	const fileName = makeStackFrameFileName(frame);
	if (!fileName) {
		return null;
	}

	return chalk.gray(
		['at', frame.originalFunctionName, `${chalk.blueBright(`(${fileName})`)}`]
			.filter(truthy)
			.join(' '),
	);
};
