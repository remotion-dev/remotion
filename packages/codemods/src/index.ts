import {
	JsxElementIdentityMismatchError,
	JsxElementNotFoundAtLocationError,
	addEffect,
	applyCodemod,
	applyVisualControl,
	assertValidEffect,
	basicCaptionsElementSource,
	computeCanUpdateDefaultPropsFromContent,
	computeSequencePropsStatusFromContent,
	computeSequencePropsSubscriptionFromContent,
	deleteEffect,
	deleteEffects,
	deleteJsxElementAtPath,
	deleteJsxNodes,
	duplicateCompositionInSource,
	duplicateEffect,
	duplicateEffects,
	duplicateJsxElementAtPath,
	duplicateJsxNodes,
	ensureEffectImport,
	ensureRemotionImports,
	ensureUseCurrentFrameHook,
	enumerateEffectArrayElements,
	findEffectCallExpression,
	findEffectsAttr,
	findEnclosingFunctionPath,
	findJsxElementPathForDeletion,
	findProjectFile,
	findSearchPosition,
	generateCanvasCaptureComposition,
	getBasicCaptionsElementFile,
	getCanUpdateDefaultPropsForProject,
	getCompositionComponentInfo,
	getCompositionDefaultPropsLine,
	getCompositionFile,
	getFolderFile,
	getJsxElementTagLabel,
	getJsxElementsWithNodePaths,
	getRootFileForProject,
	insertBasicCaptions,
	insertJsxElementIntoComposition,
	insertJsxElementIntoProjectWithNodePathRemappings,
	insertVideoLayers,
	insertSolidIntoProject,
	insertSolidIntoProjectWithNodePathRemappings,
	insertSolidIntoSource,
	makeConfigObjectExpression,
	makeInMemoryInsertJsxElementCodemodEnvironment,
	makeNewCompositionComponentSource,
	parseAndApplyCodemod,
	pasteEffects,
	reorderEffect,
	reorderSequence,
	resolveCompositionComponent,
	resolveCompositionComponentWithFile,
	simpleDiff,
	splitJsxSequence,
	splitJsxSequences,
	splitVideoFromAudio,
	updateDefaultProps,
	updateEffectKeyframes,
	updateEffectKeyframesAst,
	updateEffectProps,
	updateEffectPropsAst,
	updateInlineCaptionPatches,
	updateMultipleSequenceProps,
	updateSequenceKeyframes,
	updateSequenceKeyframesAst,
	updateSequencePropsAst,
} from './internals';

export {addSolid, type AddSolidOptions, type AddSolidResult} from './add-solid';
export {addMedia, type AddMediaOptions} from './add-media';
export {addComponent, type AddComponentOptions} from './add-component';
export {type AddContentOptions} from './insert-content';
export {type CodemodValue} from './codemod-value';
export {
	getJsxNodes,
	type GetJsxNodesOptions,
	type JsxNode,
} from './get-jsx-nodes';
export {
	getJsxNodeProps,
	type GetJsxNodePropsOptions,
	type JsxNodeProps,
} from './get-jsx-node-props';
export {
	updateJsxNodeProps,
	type UpdateJsxNodePropsOptions,
} from './update-jsx-node-props';
export {
	duplicateJsxNodes,
	type DuplicateJsxNodesOptions,
	type DuplicateJsxNodesResult,
} from './duplicate-jsx-nodes';
export {reorderJsxNode, type ReorderJsxNodeOptions} from './reorder-jsx-node';
export {splitSequences, type SplitSequencesOptions} from './split-sequences';
export {detachAudio, type DetachAudioOptions} from './detach-audio';
export type {
	JsxNodeReference,
	JsxNodePathRemapping,
	CodemodNodeResult,
	CodemodInsertionResult,
} from './node-references';
export {
	resolveCompositionComponent,
	type ResolveCompositionComponentOptions,
} from './resolve-composition-component';
export {addComposition, type AddCompositionOptions} from './add-composition';
export {
	renameComposition,
	type RenameCompositionOptions,
} from './rename-composition';
export {
	duplicateComposition,
	type DuplicateCompositionOptions,
} from './duplicate-composition';
export {
	deleteComposition,
	type DeleteCompositionOptions,
} from './delete-composition';
export {
	updateCompositionMetadata,
	type UpdateCompositionMetadataOptions,
} from './update-composition-metadata';
export {
	setCompositionDefaultProps,
	type SetCompositionDefaultPropsOptions,
} from './set-composition-default-props';
export {
	type CompositionTarget,
	type CompositionMetadata,
	type FolderReference,
} from './composition-editing';
export {addFolder, type AddFolderOptions} from './add-folder';
export {renameFolder, type RenameFolderOptions} from './rename-folder';
export {moveComposition, type MoveCompositionOptions} from './move-composition';
export {moveFolder, type MoveFolderOptions} from './move-folder';
export {unwrapFolder, type UnwrapFolderOptions} from './unwrap-folder';
export {
	type CompositionTreeItem,
	type CompositionDestination,
} from './folder-editing';
export {addEffect, type AddEffectOptions} from './add-effect';
export {
	updateEffectProps,
	type UpdateEffectPropsOptions,
} from './update-effect-props';
export {deleteEffects, type DeleteEffectsOptions} from './delete-effects';
export {
	duplicateEffects,
	type DuplicateEffectsOptions,
} from './duplicate-effects';
export {reorderEffect, type ReorderEffectOptions} from './reorder-effect';
export {type EffectReference} from './effect-references';
export {
	updateJsxNodeKeyframes,
	type JsxNodeKeyframeUpdate,
	type UpdateJsxNodeKeyframesOptions,
} from './update-jsx-node-keyframes';
export {
	updateEffectKeyframes,
	type UpdateEffectKeyframesOptions,
} from './update-effect-keyframes';
export type {
	CodemodFileChange,
	CodemodProject,
	CodemodResult,
} from './codemod-project';
export {deleteJsxNodes, type DeleteJsxNodesOptions} from './delete-jsx-nodes';
export type {
	EffectArrayElement,
	EffectDeletionTarget,
	EffectKeyframeUpdate,
	EffectPropUpdate,
	EffectTarget,
	FormatEffectFile,
	FormatKeyframesFile,
	InsertJsxElementCodemodEnvironment,
	IntroducedKeyframeIdentifiers,
	KeyframeOperation,
	PropDelta,
	RemovedProp,
	ResolvedCompositionComponent,
	ResolvedCompositionComponentWithFile,
	SequenceKeyframeUpdate,
	SequencePropUpdate,
	SequencePropsNodeUpdate,
	SequencePropsNodeUpdateResult,
	UpdateEffectPropsResult,
} from './internals';

export const CodemodsInternals = {
	JsxElementIdentityMismatchError,
	JsxElementNotFoundAtLocationError,
	addEffect,
	applyCodemod,
	applyVisualControl,
	assertValidEffect,
	basicCaptionsElementSource,
	computeCanUpdateDefaultPropsFromContent,
	computeSequencePropsStatusFromContent,
	computeSequencePropsSubscriptionFromContent,
	deleteEffect,
	deleteEffects,
	deleteJsxElementAtPath,
	deleteJsxNodes,
	duplicateCompositionInSource,
	duplicateEffect,
	duplicateEffects,
	duplicateJsxElementAtPath,
	duplicateJsxNodes,
	ensureEffectImport,
	ensureRemotionImports,
	ensureUseCurrentFrameHook,
	enumerateEffectArrayElements,
	findEffectCallExpression,
	findEffectsAttr,
	findEnclosingFunctionPath,
	findJsxElementPathForDeletion,
	findProjectFile,
	findSearchPosition,
	generateCanvasCaptureComposition,
	getBasicCaptionsElementFile,
	getCanUpdateDefaultPropsForProject,
	getCompositionComponentInfo,
	getCompositionDefaultPropsLine,
	getCompositionFile,
	getFolderFile,
	getJsxElementTagLabel,
	getJsxElementsWithNodePaths,
	getRootFileForProject,
	insertBasicCaptions,
	insertJsxElementIntoComposition,
	insertJsxElementIntoProjectWithNodePathRemappings,
	insertVideoLayers,
	insertSolidIntoProject,
	insertSolidIntoProjectWithNodePathRemappings,
	insertSolidIntoSource,
	makeConfigObjectExpression,
	makeInMemoryInsertJsxElementCodemodEnvironment,
	makeNewCompositionComponentSource,
	parseAndApplyCodemod,
	pasteEffects,
	reorderEffect,
	reorderSequence,
	resolveCompositionComponent,
	resolveCompositionComponentWithFile,
	simpleDiff,
	splitJsxSequence,
	splitJsxSequences,
	splitVideoFromAudio,
	updateDefaultProps,
	updateEffectKeyframes,
	updateEffectKeyframesAst,
	updateEffectProps,
	updateEffectPropsAst,
	updateInlineCaptionPatches,
	updateMultipleSequenceProps,
	updateSequenceKeyframes,
	updateSequenceKeyframesAst,
	updateSequencePropsAst,
};
