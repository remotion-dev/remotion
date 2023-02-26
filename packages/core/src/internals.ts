import {enableLegacyRemotionConfig} from './config.js';

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
	CompositionManagerContext,
	TAsset,
	TCompMetadata,
	TComposition,
	TSequence,
} from './CompositionManager.js';
import {CompositionManager, compositionsRef} from './CompositionManager.js';
import * as CSSUtils from './default-css.js';
import {DELAY_RENDER_CALLSTACK_TOKEN} from './delay-render.js';
import type {RemotionEnvironment} from './get-environment.js';
import {
	getRemotionEnvironment,
	useRemotionEnvironment,
} from './get-environment.js';
import {getPreviewDomElement} from './get-preview-dom-element.js';
import {IsPlayerContextProvider, useIsPlayer} from './is-player.js';
import {portalNode} from './portal-node.js';
import {PrefetchProvider} from './prefetch-state.js';
import {getRoot, waitForRoot} from './register-root.js';
import {RemotionRoot} from './RemotionRoot.js';
import {SequenceContext} from './Sequence.js';
import {
	ENV_VARIABLES_ENV_NAME,
	setupEnvVariables,
} from './setup-env-variables.js';
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
import {validateDimension} from './validation/validate-dimensions.js';
import {validateDurationInFrames} from './validation/validate-duration-in-frames.js';
import {validateFps} from './validation/validate-fps.js';
import {validateOffthreadVideoImageFormat} from './validation/validate-offthreadvideo-image-format.js';
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
	ENV_VARIABLES_ENV_NAME,
	MediaVolumeContext,
	SetMediaVolumeContext,
	validateDurationInFrames,
	validateFps,
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
	validateOffthreadVideoImageFormat,
	CanUseRemotionHooksProvider,
	CanUseRemotionHooks,
	enableLegacyRemotionConfig,
	PrefetchProvider,
	DurationsContextProvider,
	IsPlayerContextProvider,
	useIsPlayer,
	useRemotionEnvironment,
	validateFrame,
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
