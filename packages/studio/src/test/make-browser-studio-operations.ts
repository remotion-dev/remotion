import type {BrowserStudioOperations} from '@remotion/studio-shared';

const unusedOperation = (name: keyof BrowserStudioOperations): never => {
	throw new Error(`Unexpected Browser Studio operation: ${name}`);
};

export const makeBrowserStudioOperations = (
	overrides: Partial<BrowserStudioOperations>,
): BrowserStudioOperations => {
	return {
		deleteStaticFile: () => unusedOperation('deleteStaticFile'),
		downloadProject: () => unusedOperation('downloadProject'),
		findInFile: () => unusedOperation('findInFile'),
		getCompositionComponentInfo: () =>
			unusedOperation('getCompositionComponentInfo'),
		getCompositionFile: () => unusedOperation('getCompositionFile'),
		getFileSource: () => unusedOperation('getFileSource'),
		insertSolid: () => unusedOperation('insertSolid'),
		redo: () => unusedOperation('redo'),
		renameStaticFile: () => unusedOperation('renameStaticFile'),
		saveSequenceProps: () => unusedOperation('saveSequenceProps'),
		subscribeToDefaultProps: () => unusedOperation('subscribeToDefaultProps'),
		subscribeToEvent: () => unusedOperation('subscribeToEvent'),
		subscribeToSequenceProps: () => unusedOperation('subscribeToSequenceProps'),
		undo: () => unusedOperation('undo'),
		unsubscribeFromDefaultProps: () =>
			unusedOperation('unsubscribeFromDefaultProps'),
		unsubscribeFromSequenceProps: () =>
			unusedOperation('unsubscribeFromSequenceProps'),
		writeStaticFile: () => unusedOperation('writeStaticFile'),
		...overrides,
	};
};
