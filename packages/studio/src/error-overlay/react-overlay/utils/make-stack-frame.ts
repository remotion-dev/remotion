import type {StackFrame} from '@remotion/studio-shared';

export const makeStackFrame = ({
	functionName,
	fileName,
	lineNumber,
	columnNumber,
}: {
	functionName: string | null;
	fileName: string;
	lineNumber: number;
	columnNumber: number;
}): StackFrame => {
	if (functionName && functionName.indexOf('Object.') === 0) {
		functionName = functionName.slice('Object.'.length);
	}

	if (
		// Chrome has a bug with inferring function.name:
		// https://github.com/facebook/create-react-app/issues/2097
		// Let's ignore a meaningless name we get for top-level modules.
		functionName === 'friendlySyntaxErrorLabel' ||
		functionName === 'exports.__esModule' ||
		functionName === '<anonymous>' ||
		!functionName
	) {
		functionName = null;
	}

	return {
		columnNumber,
		fileName,
		functionName,
		lineNumber,
	};
};
