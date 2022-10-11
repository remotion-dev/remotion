import type {Configuration} from 'webpack';
import {enableLegacyRemotionConfig} from './config';

import {
	SharedAudioContext,
	SharedAudioContextProvider,
} from './audio/shared-audio-tags';
import {
	CanUseRemotionHooks,
	CanUseRemotionHooksProvider,
} from './CanUseRemotionHooks';
import type {CompProps} from './Composition';
import type {
	CompositionManagerContext,
	TAsset,
	TCompMetadata,
	TComposition,
	TSequence,
} from './CompositionManager';
import {CompositionManager, compositionsRef} from './CompositionManager';
import * as CSSUtils from './default-css';
import {DELAY_RENDER_CALLSTACK_TOKEN} from './delay-render';
import type {RemotionEnvironment} from './get-environment';
import {getRemotionEnvironment} from './get-environment';
import {getPreviewDomElement} from './get-preview-dom-element';
import {portalNode} from './portal-node';
import {PrefetchProvider} from './prefetch-state';
import {getRoot, waitForRoot} from './register-root';
import {RemotionRoot} from './RemotionRoot';
import {SequenceContext} from './Sequence';
import {ENV_VARIABLES_ENV_NAME, setupEnvVariables} from './setup-env-variables';
import type {
	SetTimelineContextValue,
	TimelineContextValue,
} from './timeline-position-state';
import * as TimelinePosition from './timeline-position-state';
import {truthy} from './truthy';
import {useLazyComponent} from './use-lazy-component';
import {useUnsafeVideoConfig} from './use-unsafe-video-config';
import {useVideo} from './use-video';
import {
	invalidCompositionErrorMessage,
	isCompositionIdValid,
} from './validation/validate-composition-id';
import {validateDimension} from './validation/validate-dimensions';
import {validateDurationInFrames} from './validation/validate-duration-in-frames';
import {validateFps} from './validation/validate-fps';
import {validateOffthreadVideoImageFormat} from './validation/validate-offthreadvideo-image-format';
import {DurationsContextProvider} from './video/duration-state';
import type {
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
} from './volume-position-state';
import {
	MediaVolumeContext,
	SetMediaVolumeContext,
	useMediaMutedState,
	useMediaVolumeState,
} from './volume-position-state';
import {
	RemotionContextProvider,
	useRemotionContexts,
} from './wrap-remotion-context';
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
};

type WebpackConfiguration = Configuration;

type WebpackOverrideFn = (
	currentConfiguration: WebpackConfiguration
) => WebpackConfiguration;

export type {
	TComposition,
	Timeline,
	TCompMetadata,
	TSequence,
	WebpackOverrideFn,
	WebpackConfiguration,
	TAsset,
	TimelineContextValue,
	SetTimelineContextValue,
	CompProps,
	CompositionManagerContext,
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
	RemotionEnvironment,
};
