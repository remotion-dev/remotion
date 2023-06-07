import {AssetManager} from './AssetManager.js';
import {
	SharedAudioContext,
	SharedAudioContextProvider,
} from './audio/shared-audio-tags.js';
import {
	CanUseRemotionHooks,
	CanUseRemotionHooksProvider,
} from './CanUseRemotionHooks.js';
import type {CompProps} from './Composition.js';
import type {
	TAsset,
	TCompMetadata,
	TComposition,
	TSequence,
} from './CompositionManager.js';
import {compositionsRef} from './CompositionManager.js';
import type {CompositionManagerContext} from './CompositionManagerContext.js';
import {CompositionManager} from './CompositionManagerContext.js';
import * as CSSUtils from './default-css.js';
import {DELAY_RENDER_CALLSTACK_TOKEN} from './delay-render.js';
import {EditorPropsContext, EditorPropsProvider} from './EditorProps.js';
import type {RemotionEnvironment} from './get-environment.js';
import {
	getRemotionEnvironment,
	useRemotionEnvironment,
} from './get-environment.js';
import {
	getPreviewDomElement,
	REMOTION_STUDIO_CONTAINER_ELEMENT,
} from './get-preview-dom-element.js';
import {processColor} from './interpolate-colors.js';
import {IsPlayerContextProvider, useIsPlayer} from './is-player.js';
import {NonceContext} from './nonce.js';
import {portalNode} from './portal-node.js';
import {PrefetchProvider} from './prefetch-state.js';
import {usePreload} from './prefetch.js';
import {getRoot, waitForRoot} from './register-root.js';
import {RemotionRoot} from './RemotionRoot.js';
import {resolveVideoConfig} from './resolve-video-config.js';
import {
	ResolveCompositionConfig,
	resolveCompositionsRef,
	useResolvedVideoConfig,
} from './ResolveCompositionConfig.js';
import {SequenceContext} from './SequenceContext.js';
import {SequenceManager} from './SequenceManager.js';
import {setupEnvVariables} from './setup-env-variables.js';
import type {
	SetTimelineContextValue,
	TimelineContextValue,
} from './timeline-position-state.js';
import * as TimelinePosition from './timeline-position-state.js';
import {truthy} from './truthy.js';
import {useLazyComponent} from './use-lazy-component.js';
import {useUnsafeVideoConfig} from './use-unsafe-video-config.js';
import {useVideo} from './use-video.js';
import {validateFrame} from './validate-frame.js';
import {
	invalidCompositionErrorMessage,
	isCompositionIdValid,
} from './validation/validate-composition-id.js';
import {validateDefaultAndInputProps} from './validation/validate-default-props.js';
import {validateDimension} from './validation/validate-dimensions.js';
import {validateDurationInFrames} from './validation/validate-duration-in-frames.js';
import {validateFps} from './validation/validate-fps.js';
import {DurationsContextProvider} from './video/duration-state.js';
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
import {
	RemotionContextProvider,
	useRemotionContexts,
} from './wrap-remotion-context.js';
const Timeline = TimelinePosition;

// Mark them as Internals so use don't assume this is public
// API and are less likely to use it
export const Internals = {
	useUnsafeVideoConfig,
	Timeline,
	CompositionManager,
	SequenceManager,
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
	validateDurationInFrames,
	validateFps,
	validateDefaultAndInputProps,
	validateDimension,
	getRemotionEnvironment,
	SharedAudioContext,
	SharedAudioContextProvider,
	invalidCompositionErrorMessage,
	isCompositionIdValid,
	getPreviewDomElement,
	compositionsRef,
	DELAY_RENDER_CALLSTACK_TOKEN,
	portalNode,
	waitForRoot,
	CanUseRemotionHooksProvider,
	CanUseRemotionHooks,
	PrefetchProvider,
	DurationsContextProvider,
	IsPlayerContextProvider,
	useIsPlayer,
	useRemotionEnvironment,
	validateFrame,
	EditorPropsProvider,
	EditorPropsContext,
	usePreload,
	processColor,
	NonceContext,
	resolveVideoConfig,
	useResolvedVideoConfig,
	resolveCompositionsRef,
	ResolveCompositionConfig,
	REMOTION_STUDIO_CONTAINER_ELEMENT,
	AssetManager,
	bundleName: 'bundle.js',
};

export type {
	TComposition,
	Timeline,
	TCompMetadata,
	TSequence,
	TAsset,
	TimelineContextValue,
	SetTimelineContextValue,
	CompProps,
	CompositionManagerContext,
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
	RemotionEnvironment,
};
