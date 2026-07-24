import type {CompositionDragData} from '@remotion/drag-and-drop';
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
