import {StackFrame} from '../utils/stack-frame';
import {ErrorLocation} from './map-error-to-react-stack';

export const resolveFileSource = async (
	location: ErrorLocation,
	contextLines: number
): Promise<StackFrame> => {
	const res = await fetch(
		`/api/file-source?f=${encodeURIComponent(location.fileName)}`
	);
	const text = await res.text();

	const lines = text
		.split('\n')
		.map((l, i) => {
			const oneIndexedLineNumber = i + 1;
			return [oneIndexedLineNumber, l] as [number, string];
		})
		.filter(([oneIndexedLineNumber]) => {
			return (
				Math.abs(oneIndexedLineNumber - location.lineNumber) <= contextLines
			);
		});

	const scriptCode = lines.map(([num, line]) => {
		return {
			content: line,
			highlight: location.lineNumber === num,
			lineNumber: num,
		};
	});

	return {
		_originalScriptCode: scriptCode,
		_originalColumnNumber: location.columnNumber,
		_originalFileName: location.fileName,
		_originalLineNumber: location.lineNumber,
		_scriptCode: scriptCode,
		getFunctionName: () => '',
		_originalFunctionName: null,
		columnNumber: location.columnNumber,
		fileName: location.fileName,
		functionName: null,
		getSource: () => lines.map((_, l) => l).join('\n'),
		lineNumber: location.lineNumber,
	};
};
