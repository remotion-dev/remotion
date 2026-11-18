import {
	basicCaptionsElementSource,
	getBasicCaptionsElementFile,
} from './basic-captions-element-source';
import {enumerateEffectArrayElements} from './effect-operations';
import {findSearchPosition} from './find-search-position';
import {
	computeCanUpdateDefaultPropsFromContent,
	findProjectFile,
	getCanUpdateDefaultPropsForProject,
	getCompositionComponentInfo,
	getCompositionFile,
	getCompositionsInSource,
	getFolderFile,
	getRootFileForProject,
} from './internals';
import {
	getKeyframeSourceLocationRemappings,
	getUnchangedStructureRemappings,
} from './node-references';
import {resolveOpenTimelineMedia} from './open-timeline/generate';
import {getJsxSourceLocation} from './recast-loc-to-offset';
import {RegistrationRequiresRefactorError} from './registration-requires-refactor-error';
import {resolveCompositionImportFile} from './resolve-composition-import-file';
import {resolveNodePathsFromLocations} from './resolve-node-paths-from-locations';
import {
	computeSequencePropsStatusFromContent,
	computeSequencePropsSubscriptionFromContent,
} from './sequence-props';
import {computeEffectPropsStatusesFromContent} from './sequence-props/can-update-effect-props';
import {getDurationDependentKeyframesFromContent} from './sequence-props/duration-dependent-keyframes';
import {JsxElementIdentityMismatchError} from './sequence-props/jsx-component-identity';
import {JsxElementNotFoundAtLocationError} from './sequence-props/jsx-element-not-found-at-location-error';
import {getKeyframeInterpolationFunctionForCallee} from './sequence-props/keyframe-interpolation-function';
import {getStaticNumericValue} from './sequence-props/static-numeric-value';
import {validateKeyframePasteTiming} from './validate-keyframe-paste-timing';

export {
	CodemodElement,
	createElement,
	staticFileValue,
	type CodemodElementChild,
	type CodemodElementOptions,
} from './codemod-element';
export {
	addElement,
	type AddElementOptions,
	type AddElementTarget,
	type AddElementDescriptor,
} from './add-element';
export {type CodemodValue} from './codemod-value';
export {getNodes, type GetNodesOptions, type CodemodNode} from './get-nodes';
export {
	getNodeProps,
	type GetNodePropsOptions,
	type NodeProps,
} from './get-node-props';
export {
	updateNodeProps,
	updateMultipleNodeProps,
	type NodePropChange,
	type UpdateMultipleNodePropsOptions,
	type UpdateNodePropsOptions,
} from './update-node-props';
export {
	duplicateNodes,
	type DuplicateNodesOptions,
	type DuplicateNodesResult,
} from './duplicate-nodes';
export {
	reorderNodes,
	type ReorderNodesOptions,
	type NodeMoveTiming,
} from './reorder-nodes';
export {
	pasteEffects,
	type PasteEffectsOptions,
	type PasteEffect,
} from './paste-effects';
export {
	insertBasicCaptions,
	type InsertBasicCaptionsOptions,
} from './insert-basic-captions';
export {
	updateInlineCaptionPatches,
	type UpdateInlineCaptionPatchesOptions,
	type InlineCaptionPatch,
} from './update-inline-caption-patches';
export {
	replaceNodeChild,
	type ReplaceNodeChildOptions,
} from './replace-node-child';
export {
	replaceJsxElementWithSource,
	type ReplaceJsxElementWithSourceOptions,
} from './replace-jsx-element-with-source';
export {splitSequences, type SplitSequencesOptions} from './split-sequences';
export {detachAudio, type DetachAudioOptions} from './detach-audio';
export type {
	NodeReference,
	NodePathRemapping,
	CodemodNodeResult,
	CodemodInsertionResult,
} from './node-references';
export {
	resolveCompositionComponent,
	type ResolveCompositionComponentOptions,
	type ResolvedComposition,
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
export {reorderEffects, type ReorderEffectsOptions} from './reorder-effects';
export {type EffectReference} from './effect-references';
export {
	updateNodeKeyframes,
	type NodeKeyframeUpdate,
	type UpdateNodeKeyframesOptions,
} from './update-node-keyframes';
export {
	updateEffectKeyframes,
	type UpdateEffectKeyframesOptions,
} from './update-effect-keyframes';
export type {
	CodemodFileChange,
	CodemodProject,
	CodemodSource,
	CodemodResult,
} from './codemod-project';
export {applyCodemodChanges} from './codemod-project';
export {deleteNodes, type DeleteNodesOptions} from './delete-nodes';
export {canUnwrapNode, unwrapNode, type UnwrapNodeOptions} from './unwrap-node';
export {canWrapNode, wrapNode, type WrapNodeOptions} from './wrap-node';
export {
	canPrecomposeJsxNodes,
	precomposeJsxNodes,
} from './precompose-jsx-nodes';
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
	SourceKeyframeUpdate,
} from './update-keyframes';
export type {
	CodemodEnvironment,
	PipelineInsertableElement,
	ResolvedCompositionComponent,
	ResolvedCompositionComponentWithFile,
} from './insert-jsx-element';
export type {InsertableSequenceWrapper} from './insertable-element';
export type {
	RemovedProp,
	SequencePropUpdate,
	SequencePropsNodeUpdate,
	SequencePropsNodeUpdateResult,
} from './update-sequence-props';

export const CodemodsInternals = {
	resolveCompositionImportFile,
	RegistrationRequiresRefactorError,
	computeEffectPropsStatusesFromContent,
	getDurationDependentKeyframesFromContent,
	JsxElementIdentityMismatchError,
	JsxElementNotFoundAtLocationError,
	basicCaptionsElementSource,
	computeCanUpdateDefaultPropsFromContent,
	computeSequencePropsStatusFromContent,
	computeSequencePropsSubscriptionFromContent,
	enumerateEffectArrayElements,
	findProjectFile,
	findSearchPosition,
	getBasicCaptionsElementFile,
	getCanUpdateDefaultPropsForProject,
	getCompositionComponentInfo,
	getCompositionFile,
	getCompositionsInSource,
	getFolderFile,
	getJsxSourceLocation,
	getKeyframeSourceLocationRemappings,
	getUnchangedStructureRemappings,
	getKeyframeInterpolationFunctionForCallee,
	getRootFileForProject,
	getStaticNumericValue,
	resolveNodePathsFromLocations,
	resolveOpenTimelineMedia,
	validateKeyframePasteTiming,
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
export {
	generateOpenTimelineComposition,
	type GenerateOpenTimelineCompositionOptions,
	type GenerateOpenTimelineCompositionResult,
	type OpenTimelineAnnotation,
	type OpenTimelineAsset,
	type OpenTimelineDiagnostic,
	type OpenTimelineMediaResolver,
	type OpenTimelineResolvedMedia,
} from './open-timeline/generate';
export {
	addOpenTimelineComposition,
	OpenTimelineImportError,
	type AddOpenTimelineCompositionOptions,
	type AddOpenTimelineCompositionResult,
} from './add-open-timeline-composition';
