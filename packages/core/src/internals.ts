import {
	SharedAudioContext,
	SharedAudioContextProvider,
} from './audio/shared-audio-tags.js';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import {BufferingContextReact, BufferingProvider} from './buffering.js';
import {
	CanUseRemotionHooks,
	CanUseRemotionHooksProvider,
} from './CanUseRemotionHooks.js';
import {type CompProps} from './Composition.js';
import type {
	TCompMetadata,
	TComposition,
	TRenderAsset,
	TSequence,
} from './CompositionManager.js';
import {compositionsRef} from './CompositionManager.js';
import type {CompositionManagerContext} from './CompositionManagerContext.js';
import {CompositionManager} from './CompositionManagerContext.js';
import * as CSSUtils from './default-css.js';
import {
	EditorPropsContext,
	EditorPropsProvider,
	editorPropsProviderRef,
	timeValueRef,
} from './EditorProps.js';
import {
	addSequenceStackTraces,
	enableSequenceStackTraces,
} from './enable-sequence-stack-traces.js';
import {
	getPreviewDomElement,
	REMOTION_STUDIO_CONTAINER_ELEMENT,
} from './get-preview-dom-element.js';
import type {RemotionEnvironment} from './get-remotion-environment.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import type {SerializedJSONWithCustomFields} from './input-props-serialization.js';
import {IsPlayerContextProvider, useIsPlayer} from './is-player.js';
import type {LoggingContextValue} from './log-level-context.js';
import {LogLevelContext, useLogLevel} from './log-level-context.js';
import {Log} from './log.js';
import {NonceContext} from './nonce.js';
import {playbackLogging} from './playback-logging.js';
import {portalNode} from './portal-node.js';
import {PrefetchProvider} from './prefetch-state.js';
import {usePreload} from './prefetch.js';
import {getRoot, waitForRoot} from './register-root.js';
import {RemotionRoot} from './RemotionRoot.js';
import {RenderAssetManager} from './RenderAssetManager.js';
import {resolveVideoConfig} from './resolve-video-config.js';
import {
	PROPS_UPDATED_EXTERNALLY,
	ResolveCompositionConfig,
	resolveCompositionsRef,
	useResolvedVideoConfig,
} from './ResolveCompositionConfig.js';
import {SequenceContext} from './SequenceContext.js';
import {
	SequenceManager,
	SequenceVisibilityToggleContext,
} from './SequenceManager.js';
import {setupEnvVariables} from './setup-env-variables.js';
import type {
	SetTimelineContextValue,
	TimelineContextValue,
} from './timeline-position-state.js';
import * as TimelinePosition from './timeline-position-state.js';
import {
	persistCurrentFrame,
	useTimelineSetFrame,
} from './timeline-position-state.js';
import {truthy} from './truthy.js';
import {
	calculateScale,
	CurrentScaleContext,
	PreviewSizeContext,
} from './use-current-scale.js';
import {useLazyComponent} from './use-lazy-component.js';
import {useUnsafeVideoConfig} from './use-unsafe-video-config.js';
import {useVideo} from './use-video.js';
import {validateRenderAsset} from './validation/validate-artifact.js';
import {
	invalidCompositionErrorMessage,
	isCompositionIdValid,
} from './validation/validate-composition-id.js';
import {DurationsContextProvider} from './video/duration-state.js';
import {isIosSafari} from './video/video-fragment.js';
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
import type {WatchRemotionStaticFilesPayload} from './watch-static-file.js';
import {WATCH_REMOTION_STATIC_FILES} from './watch-static-file.js';
import {
	RemotionContextProvider,
	useRemotionContexts,
} from './wrap-remotion-context.js';

// Mark them as Internals so use don't assume this is public
// API and are less likely to use it
export const Internals = {
	useUnsafeVideoConfig,
	Timeline: TimelinePosition,
	CompositionManager,
	SequenceManager,
	SequenceVisibilityToggleContext,
	RemotionRoot,
	useVideo,
	getRoot,
	useMediaVolumeState,
	useMediaMutedState,
	useLazyComponent,
	truthy,
	SequenceContext,
	useRemotionContexts,
	RemotionContextProvider,
	CSSUtils,
	setupEnvVariables,
	MediaVolumeContext,
	SetMediaVolumeContext,
	getRemotionEnvironment,
	SharedAudioContext,
	SharedAudioContextProvider,
	invalidCompositionErrorMessage,
	isCompositionIdValid,
	getPreviewDomElement,
	compositionsRef,
	portalNode,
	waitForRoot,
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
	useResolvedVideoConfig,
	resolveCompositionsRef,
	ResolveCompositionConfig,
	REMOTION_STUDIO_CONTAINER_ELEMENT,
	RenderAssetManager,
	persistCurrentFrame,
	useTimelineSetFrame,
	isIosSafari,
	WATCH_REMOTION_STATIC_FILES,
	addSequenceStackTraces,
	useMediaStartsAt,
	BufferingProvider,
	BufferingContextReact,
	enableSequenceStackTraces,
	CurrentScaleContext,
	PreviewSizeContext,
	calculateScale,
	editorPropsProviderRef,
	PROPS_UPDATED_EXTERNALLY,
	validateRenderAsset,
	Log,
	LogLevelContext,
	useLogLevel,
	playbackLogging,
	timeValueRef,
} as const;

export type {
	CompositionManagerContext,
	CompProps,
	LoggingContextValue,
	MediaVolumeContextValue,
	RemotionEnvironment,
	SerializedJSONWithCustomFields,
	SetMediaVolumeContextValue,
	SetTimelineContextValue,
	TCompMetadata,
	TComposition,
	TimelineContextValue,
	TRenderAsset,
	TSequence,
	WatchRemotionStaticFilesPayload,
};
