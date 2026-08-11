import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import type {ResolvedStackLocation} from 'remotion';

export const resolvedStackToSymbolicated = (
	location: ResolvedStackLocation | null,
): SymbolicatedStackFrame | null => {
	if (!location?.source) {
		return null;
	}

	return {
		originalFileName: location.source,
		originalLineNumber: location.line,
		originalColumnNumber: location.column,
		originalFunctionName: null,
		originalScriptCode: null,
	};
};
