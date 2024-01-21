import {
	SharedAudioContext,
	SharedAudioContextProvider,
} from './audio/shared-audio-tags.js';
import {useMediaStartsAt} from './audio/use-audio-frame.js';
import {
	CanUseRemotionHooks,
	CanUseRemotionHooksProvider,
} from './CanUseRemotionHooks.js';
import {ClipComposition, type CompProps} from './Composition.js';
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
import {EditorPropsContext, EditorPropsProvider} from './EditorProps.js';
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
import {DATE_TOKEN, FILE_TOKEN} from './input-props-serialization.js';
import {colorNames} from './interpolate-colors.js';
import {IsPlayerContextProvider, useIsPlayer} from './is-player.js';
import {NativeLayersProvider} from './NativeLayers.js';
import {NonceContext} from './nonce.js';
import {portalNode} from './portal-node.js';
import {PrefetchProvider} from './prefetch-state.js';
import {usePreload} from './prefetch.js';
import {getRoot, waitForRoot} from './register-root.js';
import {RemotionRoot} from './RemotionRoot.js';
import {RenderAssetManager} from './RenderAssetManager.js';
import {resolveVideoConfig} from './resolve-video-config.js';
import {
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
import {useLazyComponent} from './use-lazy-component.js';
import {useUnsafeVideoConfig} from './use-unsafe-video-config.js';
import {useVideo} from './use-video.js';
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
	FILE_TOKEN,
	DATE_TOKEN,
	NativeLayersProvider,
	ClipComposition,
	isIosSafari,
	WATCH_REMOTION_STATIC_FILES,
	addSequenceStackTraces,
	useMediaStartsAt,
	enableSequenceStackTraces,
	colorNames,
} as const;

export type {
	TComposition,
	TimelinePosition as Timeline,
	TCompMetadata,
	TSequence,
	TRenderAsset as TAsset,
	TimelineContextValue,
	SetTimelineContextValue,
	CompProps,
	CompositionManagerContext,
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
	RemotionEnvironment,
	SerializedJSONWithCustomFields,
	WatchRemotionStaticFilesPayload,
};
