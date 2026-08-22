import type {BrowserStudioOperations} from '@remotion/studio-shared';

const unusedOperation = (name: keyof BrowserStudioOperations): never => {
	throw new Error(`Unexpected Browser Studio operation: ${name}`);
};

export const makeBrowserStudioOperations = (
	overrides: Partial<BrowserStudioOperations>,
): BrowserStudioOperations => {
	return {
		applyCodemod: () => unusedOperation('applyCodemod'),
		consumeInitialElement: () => null,
		deleteJsxNode: () => unusedOperation('deleteJsxNode'),
		deleteStaticFile: () => unusedOperation('deleteStaticFile'),
		downloadRemoteAsset: () => unusedOperation('downloadRemoteAsset'),
		downloadProject: () => unusedOperation('downloadProject'),
		duplicateComposition: () => unusedOperation('duplicateComposition'),
		duplicateJsxNode: () => unusedOperation('duplicateJsxNode'),
		effects: {
			addEffect: () => unusedOperation('effects'),
			deleteEffects: () => unusedOperation('effects'),
			duplicateEffects: () => unusedOperation('effects'),
			pasteEffects: () => unusedOperation('effects'),
			reorderEffect: () => unusedOperation('effects'),
			saveEffectProps: () => unusedOperation('effects'),
			saveMultipleEffectProps: () => unusedOperation('effects'),
		},
		findInFile: () => unusedOperation('findInFile'),
		getCompositionComponentInfo: () =>
			unusedOperation('getCompositionComponentInfo'),
		getCompositionFile: () => unusedOperation('getCompositionFile'),
		getFileSource: () => unusedOperation('getFileSource'),
		insertElement: () => unusedOperation('insertElement'),
		insertJsxElement: () => unusedOperation('insertJsxElement'),
		insertSolid: () => unusedOperation('insertSolid'),
		keyframes: {
			addEffectKeyframe: () => unusedOperation('keyframes'),
			addKeyframes: () => unusedOperation('keyframes'),
			addSequenceKeyframe: () => unusedOperation('keyframes'),
			batchUpdateKeyframeSettings: () => unusedOperation('keyframes'),
			deleteKeyframes: () => unusedOperation('keyframes'),
			moveKeyframes: () => unusedOperation('keyframes'),
			updateEffectKeyframeSettings: () => unusedOperation('keyframes'),
			updateSequenceKeyframeSettings: () => unusedOperation('keyframes'),
		},
		packageInstallation: {
			installPackages: () => unusedOperation('packageInstallation'),
		},
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
