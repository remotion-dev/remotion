import {
	CompositionManager,
	TCompMetadata,
	TComposition,
	TSequence,
} from './CompositionManager';
import {getOutputCodecOrUndefined} from './config/codec';
import {getConcurrency} from './config/concurrency';
import {
	getWebpackOverrideFn,
	WebpackOverrideFn,
} from './config/override-webpack';
import {getShouldOverwrite} from './config/overwrite';
import {getPixelFormat} from './config/pixel-format';
import {getQuality} from './config/quality';
import * as perf from './perf';
import {getCompositionName, getIsEvaluation, getRoot} from './register-root';
import {RemotionRoot} from './RemotionRoot';
import * as Timeline from './timeline-position-state';
import {useUnsafeVideoConfig} from './use-unsafe-video-config';
import {useVideo} from './use-video';

// Mark them as Internals so use don't assume this is public
// API and are less likely to use it
export const Internals = {
	perf,
	useUnsafeVideoConfig,
	Timeline,
	CompositionManager,
	RemotionRoot,
	useVideo,
	getRoot,
	getCompositionName,
	getIsEvaluation,
	getPixelFormat,
	getConcurrency,
	getShouldOverwrite,
	getOutputCodecOrUndefined,
	getWebpackOverrideFn,
	getQuality,
};

export type {
	TComposition,
	Timeline,
	TCompMetadata,
	TSequence,
	WebpackOverrideFn,
};
