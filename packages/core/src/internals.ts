import {createRef} from 'react';
import {getAbsoluteSrc} from './absolute-src.js';
import {AudioForPreview} from './audio/AudioForPreview.js';
import type {ScheduleAudioNodeResult} from './audio/shared-audio-tags.js';
import {
	SharedAudioContext,
	SharedAudioContextProvider,
	SharedAudioTagsContext,
	SharedAudioTagsContextProvider,
	type ScheduleAudioNodeOptions,
} from './audio/shared-audio-tags.js';
import type {RemotionAudioContextState} from './audio/use-audio-context.js';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from './audio/use-audio-frame.js';
import {
	BufferingContextReact,
	BufferingProvider,
	useIsPlayerBuffering,
} from './buffering.js';
import {calculateMediaDuration} from './calculate-media-duration.js';
import {
	CanUseRemotionHooks,
	CanUseRemotionHooksProvider,
} from './CanUseRemotionHooks.js';
import {CompositionRenderErrorContext} from './composition-render-error-context.js';
import {type CompProps} from './Composition.js';
import type {
	TCompMetadata,
	TComposition,
	TRenderAsset,
	TSequence,
} from './CompositionManager.js';
import {compositionsRef} from './CompositionManager.js';
import type {CompositionManagerContext} from './CompositionManagerContext.js';
import {
	CompositionManager,
	CompositionSetters,
} from './CompositionManagerContext.js';
import {CompositionManagerProvider} from './CompositionManagerProvider.js';
import * as CSSUtils from './default-css.js';
import {OBJECTFIT_CONTAIN_CLASS_NAME} from './default-css.js';
import {
	EditorPropsContext,
	EditorPropsProvider,
	timeValueRef,
} from './EditorProps.js';
import {createEffect} from './effects/create-effect.js';
import {runEffectChain} from './effects/run-effect-chain.js';
import {useEffectChainState} from './effects/use-effect-chain-state.js';
import {
	getCodeValuesCtx,
	getEffectCodeValuesCtx,
	useMemoizedEffectDefinitions,
	useMemoizedEffects,
} from './effects/use-memoized-effects.js';
import {
	createWebGL2ContextError,
	createWebGLContextError,
} from './effects/webgl2-context-error.js';
import {
	addSequenceStackTraces,
	getComponentsToAddStacksTo,
} from './enable-sequence-stack-traces.js';
import {findPropsToDelete} from './find-props-to-delete.js';
import {
	flattenActiveSchema,
	getFlatSchemaWithAllKeys,
} from './flatten-schema.js';
import {getAssetDisplayName} from './get-asset-file-name.js';
import {getEffectiveVisualModeValue} from './get-effective-visual-mode-value.js';
import {
	getPreviewDomElement,
	REMOTION_STUDIO_CONTAINER_ELEMENT,
} from './get-preview-dom-element.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import {
	getInputPropsOverride,
	setInputPropsOverride,
} from './input-props-override.js';
import type {SerializedJSONWithCustomFields} from './input-props-serialization.js';
import {IsPlayerContextProvider, useIsPlayer} from './is-player.js';
import type {LoggingContextValue} from './log-level-context.js';
import {LogLevelContext, useLogLevel} from './log-level-context.js';
import {Log} from './log.js';
import {MaxMediaCacheSizeContext} from './max-video-cache-size.js';
import type {NonceHistory} from './nonce.js';
import {NonceContext} from './nonce.js';
import {playbackLogging} from './playback-logging.js';
import {portalNode} from './portal-node.js';
import {PrefetchProvider} from './prefetch-state.js';
import {usePreload} from './prefetch.js';
import {PremountContext} from './PremountContext.js';
import {getRoot, waitForRoot} from './register-root.js';
import type {RemotionEnvironment} from './remotion-environment-context.js';
import {RemotionEnvironmentContext} from './remotion-environment-context.js';
import {RemotionRootContexts} from './RemotionRoot.js';
import {
	RenderAssetManager,
	RenderAssetManagerProvider,
} from './RenderAssetManager.js';
import {
	resolveVideoConfig,
	resolveVideoConfigOrCatch,
} from './resolve-video-config.js';
import {
	ResolveCompositionContext,
	resolveCompositionsRef,
	useResolvedVideoConfig,
} from './ResolveCompositionConfig.js';
import {
	hiddenField,
	sequencePremountSchema,
	sequenceSchema,
	sequenceStyleSchema,
	sequenceVisualStyleSchema,
	type SequenceFieldSchema,
	type SequenceSchema,
	type VisibleFieldSchema,
} from './sequence-field-schema.js';
import type {
	OverrideIdToNodePaths,
	OverrideToNodePathGetters,
	OverrideToNodeSetters,
} from './sequence-node-path.js';
import {
	OverrideIdsToNodePathsGettersContext,
	OverrideIdsToNodePathsSettersContext,
} from './sequence-node-path.js';
import type {ResolvedStackLocation} from './sequence-stack-traces.js';
import {SequenceStackTracesUpdateContext} from './sequence-stack-traces.js';
import {SequenceContext} from './SequenceContext.js';
import type {CannotUpdateSequenceReason} from './SequenceManager.js';
import {
	makeSequencePropsSubscriptionKey,
	SequenceManager,
	VisualModeCodeValuesContext,
	VisualModeDragOverridesContext,
	VisualModeSettersContext,
	type CanUpdateEffectPropsResponse,
	type CanUpdateEffectPropsResponseFalse,
	type CanUpdateEffectPropsResponseTrue,
	type CanUpdateSequencePropsResponse,
	type CanUpdateSequencePropsResponseFalse,
	type CanUpdateSequencePropsResponseTrue,
	type SequenceNodePath,
	type SequencePropsSubscriptionKey,
} from './SequenceManager.js';
import {setupEnvVariables} from './setup-env-variables.js';
import * as TimelinePosition from './timeline-position-state.js';
import {
	persistCurrentFrame,
	usePlaybackRate,
	useTimelineContext,
	useTimelineSetFrame,
} from './timeline-position-state.js';
import {
	AbsoluteTimeContext,
	PlaybackRateContext,
	SetTimelineContext,
	TimelineContext,
	type PlaybackRateContextValue,
	type SetTimelineContextValue,
	type TimelineContextValue,
} from './TimelineContext.js';
import {truthy} from './truthy.js';
import {
	calculateScale,
	CurrentScaleContext,
	PreviewSizeContext,
} from './use-current-scale.js';
import {DelayRenderContextType} from './use-delay-render.js';
import {useLazyComponent} from './use-lazy-component.js';
import {useAudioEnabled, useVideoEnabled} from './use-media-enabled.js';
import {
	useBasicMediaInTimeline,
	useMediaInTimeline,
} from './use-media-in-timeline.js';
import type {
	CanUpdateSequencePropStatusFalse,
	CanUpdateSequencePropStatusTrue,
	GetCodeValues,
	GetDragOverrides,
	GetEffectCodeValues,
	GetEffectDragOverrides,
} from './use-schema.js';
import {
	computeEffectiveSchemaValuesDotNotation,
	type CanUpdateSequencePropStatus,
	type CodeValues,
	type DragOverrides,
	type EffectDragOverrides,
} from './use-schema.js';
import {useUnsafeVideoConfig} from './use-unsafe-video-config.js';
import {useVideo} from './use-video.js';
import {validateMediaProps} from './validate-media-props.js';
import {
	resolveTrimProps,
	validateMediaTrimProps,
} from './validate-start-from-props.js';
import {validateRenderAsset} from './validation/validate-artifact.js';
import {
	invalidCompositionErrorMessage,
	isCompositionIdValid,
} from './validation/validate-composition-id.js';
import {DurationsContextProvider} from './video/duration-state.js';
import {InnerOffthreadVideo} from './video/OffthreadVideo.js';
import {isIosSafari} from './video/video-fragment.js';
import {VideoForPreview} from './video/VideoForPreview.js';
import type {
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
} from './volume-position-state.js';
import {
	MediaVolumeContext,
	SetMediaVolumeContext,
	useMediaMutedState,
	useMediaVolumeState,
} from './volume-position-state.js';
import {evaluateVolume} from './volume-prop.js';
import {warnAboutTooHighVolume} from './volume-safeguard.js';
import type {WatchRemotionStaticFilesPayload} from './watch-static-file.js';
import {WATCH_REMOTION_STATIC_FILES} from './watch-static-file.js';
import {wrapInSchema} from './wrap-in-schema.js';
import {
	RemotionContextProvider,
	useRemotionContexts,
} from './wrap-remotion-context.js';
export type {EffectChainState} from './effects/run-effect-chain.js';

// needs to be in core package so gets deduplicated in studio
const compositionSelectorRef = createRef<{
	expandComposition: (compName: string) => void;
	selectComposition: (compName: string) => void;
	toggleFolder: (folderName: string, parentName: string | null) => void;
}>();

// Mark them as Internals so use don't assume this is public
// API and are less likely to use it
export const Internals = {
	MaxMediaCacheSizeContext,
	useUnsafeVideoConfig,
	useFrameForVolumeProp,
	useTimelinePosition: TimelinePosition.useTimelinePosition,
	useAbsoluteTimelinePosition: TimelinePosition.useAbsoluteTimelinePosition,
	evaluateVolume,
	getAbsoluteSrc,
	getAssetDisplayName,
	Timeline: TimelinePosition,
	validateMediaTrimProps,
	validateMediaProps,
	resolveTrimProps,
	VideoForPreview,
	CompositionManager,
	CompositionSetters,
	VisualModeCodeValuesContext,
	VisualModeDragOverridesContext,
	VisualModeSettersContext,
	SequenceManager,
	SequenceStackTracesUpdateContext,
	wrapInSchema,
	sequenceSchema,
	sequenceStyleSchema,
	sequenceVisualStyleSchema,
	sequencePremountSchema,
	flattenActiveSchema,
	getFlatSchemaWithAllKeys,
	RemotionRootContexts,
	CompositionManagerProvider,
	useVideo,
	getRoot,
	useMediaVolumeState,
	useMediaMutedState,
	useMediaInTimeline,
	useLazyComponent,
	truthy,
	SequenceContext,
	PremountContext,
	useRemotionContexts,
	RemotionContextProvider,
	CSSUtils,
	setupEnvVariables,
	MediaVolumeContext,
	SetMediaVolumeContext,
	getRemotionEnvironment,
	SharedAudioContext,
	SharedAudioContextProvider,
	SharedAudioTagsContext,
	SharedAudioTagsContextProvider,
	invalidCompositionErrorMessage,
	calculateMediaDuration,
	isCompositionIdValid,
	getPreviewDomElement,
	compositionsRef,
	portalNode,
	waitForRoot,
	SetTimelineContext,
	CanUseRemotionHooksProvider,
	CanUseRemotionHooks,
	PrefetchProvider,
	DurationsContextProvider,
	IsPlayerContextProvider,
	useIsPlayer,
	EditorPropsProvider,
	EditorPropsContext,
	usePreload,
	NonceContext,
	resolveVideoConfig,
	resolveVideoConfigOrCatch,
	ResolveCompositionContext,
	useResolvedVideoConfig,
	resolveCompositionsRef,
	REMOTION_STUDIO_CONTAINER_ELEMENT,
	RenderAssetManager,
	persistCurrentFrame,
	usePlaybackRate,
	useTimelineContext,
	useTimelineSetFrame,
	isIosSafari,
	WATCH_REMOTION_STATIC_FILES,
	addSequenceStackTraces,
	useMediaStartsAt,
	BufferingProvider,
	BufferingContextReact,
	getComponentsToAddStacksTo,
	CurrentScaleContext,
	PreviewSizeContext,
	calculateScale,
	validateRenderAsset,
	Log,
	LogLevelContext,
	useLogLevel,
	playbackLogging,
	timeValueRef,
	compositionSelectorRef,
	RemotionEnvironmentContext,
	warnAboutTooHighVolume,
	AudioForPreview,
	OBJECTFIT_CONTAIN_CLASS_NAME,
	InnerOffthreadVideo,
	useBasicMediaInTimeline,
	getInputPropsOverride,
	setInputPropsOverride,
	useVideoEnabled,
	useAudioEnabled,
	useIsPlayerBuffering,
	TimelinePosition,
	DelayRenderContextType,
	TimelineContext,
	PlaybackRateContext,
	AbsoluteTimeContext,
	RenderAssetManagerProvider,
	getEffectiveVisualModeValue,
	CompositionRenderErrorContext,
	useEffectChainState,
	runEffectChain,
	useMemoizedEffects,
	useMemoizedEffectDefinitions,
	createEffect,
	createWebGLContextError,
	createWebGL2ContextError,
	computeEffectiveSchemaValuesDotNotation,
	OverrideIdsToNodePathsGettersContext,
	OverrideIdsToNodePathsSettersContext,
	findPropsToDelete,
	makeSequencePropsSubscriptionKey,
	getCodeValuesCtx,
	getEffectCodeValuesCtx,
	hiddenField,
} as const;

export type {
	CannotUpdateSequenceReason,
	CanUpdateEffectPropsResponse,
	CanUpdateEffectPropsResponseFalse,
	CanUpdateEffectPropsResponseTrue,
	CanUpdateSequencePropsResponse,
	CanUpdateSequencePropsResponseFalse,
	CanUpdateSequencePropsResponseTrue,
	CanUpdateSequencePropStatus,
	CanUpdateSequencePropStatusFalse,
	CanUpdateSequencePropStatusTrue,
	CodeValues,
	CompositionManagerContext,
	CompProps,
	DragOverrides,
	EffectDragOverrides,
	GetCodeValues,
	GetDragOverrides,
	GetEffectCodeValues,
	GetEffectDragOverrides,
	LoggingContextValue,
	MediaVolumeContextValue,
	NonceHistory,
	OverrideIdsToNodePathsGettersContext,
	OverrideIdsToNodePathsSettersContext,
	OverrideIdToNodePaths,
	OverrideToNodePathGetters,
	OverrideToNodeSetters,
	PlaybackRateContextValue,
	RemotionEnvironment,
	ResolvedStackLocation,
	ScheduleAudioNodeOptions,
	ScheduleAudioNodeResult,
	SequenceFieldSchema,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
	SequenceSchema,
	SerializedJSONWithCustomFields,
	SetMediaVolumeContextValue,
	SetTimelineContextValue,
	TCompMetadata,
	TComposition,
	TimelineContextValue,
	TRenderAsset,
	TSequence,
	VisibleFieldSchema,
	WatchRemotionStaticFilesPayload,
	RemotionAudioContextState,
};
