import type {CompositionDragData} from '@remotion/studio-protocol';
import type {SymbolicatedStackFrame} from './stack-types';

export const compositionDragDataToSymbolicatedStack = (
	dragData: CompositionDragData,
): SymbolicatedStackFrame | null => {
	if (dragData.compositionFile === null) {
		return null;
	}

	return {
		originalColumnNumber: null,
		originalFileName: dragData.compositionFile,
		originalFunctionName: null,
		originalLineNumber: null,
		originalScriptCode: null,
	};
};
