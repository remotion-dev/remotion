import type {BrowserStudioOperations} from '@remotion/studio-shared';

const unusedOperation = (name: keyof BrowserStudioOperations): never => {
	throw new Error(`Unexpected Browser Studio operation: ${name}`);
};

export const makeBrowserStudioOperations = (
	overrides: Partial<BrowserStudioOperations>,
): BrowserStudioOperations => {
	return {
		addComposition: () => unusedOperation('addComposition'),
		addFolder: () => unusedOperation('addFolder'),
		consumeInitialElement: () => null,
		deleteNodes: () => unusedOperation('deleteNodes'),
		deleteComposition: () => unusedOperation('deleteComposition'),
		deleteStaticFile: () => unusedOperation('deleteStaticFile'),
		downloadRemoteAsset: () => unusedOperation('downloadRemoteAsset'),
		downloadProject: () => unusedOperation('downloadProject'),
		duplicateComposition: () => unusedOperation('duplicateComposition'),
		duplicateNodes: () => unusedOperation('duplicateNodes'),
		precomposeJsxNodes: () => unusedOperation('precomposeJsxNodes'),
		wrapNode: () => unusedOperation('wrapNode'),
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
		insertCompositionElement: () => unusedOperation('insertCompositionElement'),
		moveComposition: () => unusedOperation('moveComposition'),
		moveFolder: () => unusedOperation('moveFolder'),
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
		renameComposition: () => unusedOperation('renameComposition'),
		renameFolder: () => unusedOperation('renameFolder'),
		redo: () => unusedOperation('redo'),
		renameStaticFile: () => unusedOperation('renameStaticFile'),
		reorderSequence: () => unusedOperation('reorderSequence'),
		saveSequenceProps: () => unusedOperation('saveSequenceProps'),
		splitSequences: () => unusedOperation('splitSequences'),
		splitVideoFromAudio: () => unusedOperation('splitVideoFromAudio'),
		insertBasicCaptions: () => unusedOperation('insertBasicCaptions'),
		subscribeToDefaultProps: () => unusedOperation('subscribeToDefaultProps'),
		subscribeToEvent: () => unusedOperation('subscribeToEvent'),
		subscribeToSequenceProps: () => unusedOperation('subscribeToSequenceProps'),
		undo: () => unusedOperation('undo'),
		unsubscribeFromDefaultProps: () =>
			unusedOperation('unsubscribeFromDefaultProps'),
		unsubscribeFromSequenceProps: () =>
			unusedOperation('unsubscribeFromSequenceProps'),
		updateDefaultProps: () => unusedOperation('updateDefaultProps'),
		updateCompositionMetadata: () =>
			unusedOperation('updateCompositionMetadata'),
		unwrapFolder: () => unusedOperation('unwrapFolder'),
		writeStaticFile: () => unusedOperation('writeStaticFile'),
		...overrides,
	};
};
