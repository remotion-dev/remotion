import type {BrowserStudioOperations} from '@remotion/studio-shared';

const unusedOperation = (name: keyof BrowserStudioOperations): never => {
	throw new Error(`Unexpected Browser Studio operation: ${name}`);
};

export const makeBrowserStudioOperations = (
	overrides: Partial<BrowserStudioOperations>,
): BrowserStudioOperations => {
	return {
		deleteStaticFile: () => unusedOperation('deleteStaticFile'),
		findInFile: () => unusedOperation('findInFile'),
		getCompositionComponentInfo: () =>
			unusedOperation('getCompositionComponentInfo'),
		getCompositionFile: () => unusedOperation('getCompositionFile'),
		getFileSource: () => unusedOperation('getFileSource'),
		insertSolid: () => unusedOperation('insertSolid'),
		redo: () => unusedOperation('redo'),
		renameStaticFile: () => unusedOperation('renameStaticFile'),
		subscribeToEvent: () => unusedOperation('subscribeToEvent'),
		undo: () => unusedOperation('undo'),
		writeStaticFile: () => unusedOperation('writeStaticFile'),
		...overrides,
	};
};
