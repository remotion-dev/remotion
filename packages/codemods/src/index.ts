import {
	basicCaptionsElementSource,
	getBasicCaptionsElementFile,
} from './basic-captions-element-source';
import {enumerateEffectArrayElements, pasteEffects} from './effect-operations';
import {findSearchPosition} from './find-search-position';
import {insertBasicCaptions} from './insert-basic-captions';
import {
	insertJsxElementIntoComposition,
	insertJsxElementIntoProjectWithNodePathRemappings,
	resolveCompositionComponent,
	resolveCompositionComponentWithFile,
} from './insert-jsx-element';
import {
	computeCanUpdateDefaultPropsFromContent,
	findProjectFile,
	getCanUpdateDefaultPropsForProject,
	getCompositionComponentInfo,
	getCompositionFile,
	getFolderFile,
	getRootFileForProject,
} from './internals';
import {computeSequencePropsSubscriptionFromContent} from './sequence-props';
import {JsxElementIdentityMismatchError} from './sequence-props/jsx-component-identity';
import {JsxElementNotFoundAtLocationError} from './sequence-props/jsx-element-not-found-at-location-error';
import {simpleDiff} from './simple-diff';
import {updateInlineCaptionPatches} from './update-inline-caption-patches';

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
	updateMultipleJsxNodeProps,
	type JsxNodePropChange,
	type UpdateMultipleJsxNodePropsOptions,
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
export {applyCodemodChanges} from './codemod-project';
export {deleteJsxNodes, type DeleteJsxNodesOptions} from './delete-jsx-nodes';
export type {
	EffectArrayElement,
	EffectDeletionTarget,
	EffectPropUpdate,
	EffectTarget,
	FormatEffectFile,
	PropDelta,
	UpdateEffectPropsResult,
} from './effect-operations';
export type {
	EffectKeyframeUpdate,
	FormatKeyframesFile,
	IntroducedKeyframeIdentifiers,
	KeyframeOperation,
	SequenceKeyframeUpdate,
} from './update-keyframes';
export type {
	InsertJsxElementCodemodEnvironment,
	ResolvedCompositionComponent,
	ResolvedCompositionComponentWithFile,
} from './insert-jsx-element';
export type {
	RemovedProp,
	SequencePropUpdate,
	SequencePropsNodeUpdate,
	SequencePropsNodeUpdateResult,
} from './update-sequence-props';

export const CodemodsInternals = {
	JsxElementIdentityMismatchError,
	JsxElementNotFoundAtLocationError,
	basicCaptionsElementSource,
	computeCanUpdateDefaultPropsFromContent,
	computeSequencePropsSubscriptionFromContent,
	enumerateEffectArrayElements,
	findProjectFile,
	findSearchPosition,
	getBasicCaptionsElementFile,
	getCanUpdateDefaultPropsForProject,
	getCompositionComponentInfo,
	getCompositionFile,
	getFolderFile,
	getRootFileForProject,
	insertBasicCaptions,
	insertJsxElementIntoComposition,
	insertJsxElementIntoProjectWithNodePathRemappings,
	pasteEffects,
	resolveCompositionComponent,
	resolveCompositionComponentWithFile,
	simpleDiff,
	updateInlineCaptionPatches,
};

export {
	addCanvasCaptureComposition,
	type AddCanvasCaptureCompositionOptions,
} from './add-canvas-capture-composition';
export {
	updateVisualControls,
	type UpdateVisualControlsOptions,
	type UpdateVisualControlsResult,
} from './update-visual-controls';
