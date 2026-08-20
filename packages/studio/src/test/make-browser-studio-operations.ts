import type {BrowserStudioOperations} from '@remotion/studio-shared';

const unusedOperation = (name: keyof BrowserStudioOperations): never => {
	throw new Error(`Unexpected Browser Studio operation: ${name}`);
};

export const makeBrowserStudioOperations = (
	overrides: Partial<BrowserStudioOperations>,
): BrowserStudioOperations => {
	return {
		applyCodemod: () => unusedOperation('applyCodemod'),
		deleteJsxNode: () => unusedOperation('deleteJsxNode'),
		deleteStaticFile: () => unusedOperation('deleteStaticFile'),
		downloadProject: () => unusedOperation('downloadProject'),
		duplicateComposition: () => unusedOperation('duplicateComposition'),
		findInFile: () => unusedOperation('findInFile'),
		getCompositionComponentInfo: () =>
			unusedOperation('getCompositionComponentInfo'),
		getCompositionFile: () => unusedOperation('getCompositionFile'),
		getFileSource: () => unusedOperation('getFileSource'),
		insertElement: () => unusedOperation('insertElement'),
		insertJsxElement: () => unusedOperation('insertJsxElement'),
		insertSolid: () => unusedOperation('insertSolid'),
		prepareElementInstall: () => unusedOperation('prepareElementInstall'),
		redo: () => unusedOperation('redo'),
		renameStaticFile: () => unusedOperation('renameStaticFile'),
		reorderSequence: () => unusedOperation('reorderSequence'),
		saveSequenceProps: () => unusedOperation('saveSequenceProps'),
		splitJsxSequence: () => unusedOperation('splitJsxSequence'),
		splitVideoFromAudio: () => unusedOperation('splitVideoFromAudio'),
		subscribeToDefaultProps: () => unusedOperation('subscribeToDefaultProps'),
		subscribeToEvent: () => unusedOperation('subscribeToEvent'),
		subscribeToSequenceProps: () => unusedOperation('subscribeToSequenceProps'),
		undo: () => unusedOperation('undo'),
		unsubscribeFromDefaultProps: () =>
			unusedOperation('unsubscribeFromDefaultProps'),
		unsubscribeFromSequenceProps: () =>
			unusedOperation('unsubscribeFromSequenceProps'),
		updateDefaultProps: () => unusedOperation('updateDefaultProps'),
		writeStaticFile: () => unusedOperation('writeStaticFile'),
		...overrides,
	};
};
