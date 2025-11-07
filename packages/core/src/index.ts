import './_check-rsc.js';
import './asset-types.js';
import {Clipper} from './Clipper.js';
import type {Codec} from './codec.js';
import type {
	AnyCompMetadata,
	AnyComposition,
	AudioOrVideoAsset,
	LoopDisplay,
	TRenderAsset,
} from './CompositionManager.js';
import type {DelayRenderScope} from './delay-render.js';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import type {StaticFile} from './get-static-files.js';
import {useIsPlayer} from './is-player.js';
import type {LogLevel} from './log.js';
import {checkMultipleRemotionVersions} from './multiple-versions-warning.js';
import {Null} from './Null.js';
import type {ProResProfile} from './prores-profile.js';
import type {PixelFormat, VideoImageFormat} from './render-types.js';
import {Sequence} from './Sequence.js';
import type {VideoConfig} from './video-config.js';

export type VideoConfigWithSerializedProps = Omit<
	VideoConfig,
	'defaultProps' | 'props'
> & {
	serializedDefaultPropsWithCustomSchema: string;
	serializedResolvedPropsWithCustomSchema: string;
};

declare global {
	interface Window {
		remotion_renderReady: boolean;
		remotion_delayRenderTimeouts: {
			[key: string]: {
				label: string | null;
				timeout: number | Timer;
				startTime: number;
			};
		};
		remotion_cancelledError: string | undefined;
		remotion_getCompositionNames: () => string[];
		// Fallback list of seen composition IDs, populated as early as possible by <Composition>
		remotion_seenCompositionIds: string[];
		getStaticCompositions: () => Promise<VideoConfigWithSerializedProps[]>;
		remotion_calculateComposition: (
			compId: string,
		) => Promise<VideoConfigWithSerializedProps>;
		remotion_setBundleMode: (bundleMode: BundleState) => void;
		remotion_staticBase: string;
		remotion_staticFiles: StaticFile[];
		remotion_publicPath: string;
		remotion_publicFolderExists: string | null;
		remotion_editorName: string | null;
		remotion_ignoreFastRefreshUpdate: number | null;
		remotion_numberOfAudioTags: number;
		remotion_audioLatencyHint: AudioContextLatencyCategory | undefined;
		remotion_logLevel: LogLevel;
		remotion_projectName: string;
		remotion_cwd: string;
		remotion_studioServerCommand: string;
		remotion_setFrame: (
			frame: number,
			composition: string,
			attempt: number,
		) => void;
		remotion_attempt: number;
		remotion_initialFrame: number;
		remotion_proxyPort: number;
		remotion_audioEnabled: boolean;
		remotion_videoEnabled: boolean;
		remotion_puppeteerTimeout: number;
		remotion_broadcastChannel: BroadcastChannel | undefined;
		remotion_inputProps: string;
		remotion_envVariables: string;
		remotion_isMainTab: boolean;
		remotion_mediaCacheSizeInBytes: number | null;
		remotion_initialMemoryAvailable: number | null;
		remotion_collectAssets: () => TRenderAsset[];
		remotion_isPlayer: boolean;
		remotion_isStudio: boolean;
		remotion_isReadOnlyStudio: boolean;
		remotion_isBuilding: undefined | (() => void);
		remotion_finishedBuilding: undefined | (() => void);
		siteVersion: '11';
		remotion_version: string;
		remotion_imported: string | boolean;
		remotion_unsavedProps: boolean | undefined;
	}
}

export type BundleCompositionState = {
	type: 'composition';
	compositionName: string;
	serializedResolvedPropsWithSchema: string;
	compositionHeight: number;
	compositionDurationInFrames: number;
	compositionWidth: number;
	compositionFps: number;
	compositionDefaultCodec: Codec;
	compositionDefaultOutName: string | null;
	compositionDefaultVideoImageFormat: VideoImageFormat | null;
	compositionDefaultPixelFormat: PixelFormat | null;
	compositionDefaultProResProfile: ProResProfile | null;
};

export type BundleIndexState = {
	type: 'index';
};

export type BundleEvaluationState = {
	type: 'evaluation';
};

export type BundleState =
	| BundleIndexState
	| BundleEvaluationState
	| BundleCompositionState;

checkMultipleRemotionVersions();
export * from './AbsoluteFill.js';
export * from './animated-image/index.js';
export {Artifact} from './Artifact.js';
export {Audio, Html5Audio, RemotionAudioProps} from './audio/index.js';
export type {LoopVolumeCurveBehavior} from './audio/use-audio-frame.js';
export {cancelRender} from './cancel-render.js';
export {
	CalculateMetadataFunction,
	Composition,
	CompositionProps,
	CompProps,
	StillProps,
} from './Composition.js';
export type {CanvasContent} from './CompositionManagerContext.js';
export {getInputProps} from './config/input-props.js';
export {continueRender, delayRender} from './delay-render.js';
export {DownloadBehavior} from './download-behavior.js';
export * from './easing.js';
export * from './Folder.js';
export * from './freeze.js';
export {getRemotionEnvironment} from './get-remotion-environment.js';
export {getStaticFiles, StaticFile} from './get-static-files.js';
export * from './IFrame.js';
export {Img, ImgProps} from './Img.js';
export * from './internals.js';
export {interpolateColors} from './interpolate-colors.js';
export {LogLevel} from './log.js';
export {Loop} from './loop/index.js';
export {
	EasingFunction,
	ExtrapolateType,
	interpolate,
	InterpolateOptions,
	random,
	RandomSeed,
} from './no-react';
export {prefetch, PrefetchOnProgress} from './prefetch.js';
export {registerRoot} from './register-root.js';
export type {PixelFormat, VideoImageFormat} from './render-types.js';
export {
	AbsoluteFillLayout,
	LayoutAndStyle,
	Sequence,
	SequenceProps,
	SequencePropsWithoutDuration,
} from './Sequence.js';
export {Series} from './series/index.js';
export * from './spring/index.js';
export {staticFile} from './static-file.js';
export * from './Still.js';
export type {PlayableMediaTag} from './timeline-position-state.js';
export {useBufferState} from './use-buffer-state';
export {useCurrentFrame} from './use-current-frame.js';
export {
	CurrentScaleContextType,
	PreviewSize,
	PreviewSizeCtx,
	Translation,
	useCurrentScale,
} from './use-current-scale';
export {useDelayRender} from './use-delay-render';
export {useRemotionEnvironment} from './use-remotion-environment.js';
export * from './use-video-config.js';
export * from './version.js';
export * from './video-config.js';
export {
	Html5Video,
	OffthreadVideo,
	OffthreadVideoProps,
	RemotionMainVideoProps,
	RemotionOffthreadVideoProps,
	RemotionVideoProps,
	Video,
} from './video/index.js';
export type {OnVideoFrame} from './video/props.js';
export type {VolumeProp} from './volume-prop.js';
export {watchStaticFile} from './watch-static-file.js';

export const Experimental = {
	/**
	 * @description This is a special component that will cause Remotion to only partially capture the frame of the video.
	 * @see [Documentation](https://www.remotion.dev/docs/clipper)
	 */
	Clipper,
	/**
	 * @description This is a special component, that, when rendered, will skip rendering the frame altogether.
	 * @see [Documentation](https://www.remotion.dev/docs/null)
	 */
	Null,
	useIsPlayer,
};

const proxyObj = {};

export const Config = new Proxy(proxyObj, {
	get(_, prop): unknown {
		if (
			prop === 'Bundling' ||
			prop === 'Rendering' ||
			prop === 'Log' ||
			prop === 'Puppeteer' ||
			prop === 'Output'
		) {
			return Config;
		}

		return () => {
			/* eslint-disable no-console */
			console.warn(
				'⚠️  The CLI configuration has been extracted from Remotion Core.',
			);
			console.warn('Update the import from the config file:');
			console.warn();
			console.warn('- Delete:');
			console.warn('import {Config} from "remotion";');
			console.warn('+ Replace:');
			console.warn('import {Config} from "@remotion/cli/config";');
			console.warn();
			console.warn(
				'For more information, see https://www.remotion.dev/docs/4-0-migration.',
			);
			/* eslint-enable no-console */

			process.exit(1);
		};
	},
});

addSequenceStackTraces(Sequence);

export type _InternalTypes = {
	AnyComposition: AnyComposition;
	BundleCompositionState: BundleCompositionState;
	BundleState: BundleState;
	VideoConfigWithSerializedProps: VideoConfigWithSerializedProps;
	AnyCompMetadata: AnyCompMetadata;
	AudioOrVideoAsset: AudioOrVideoAsset;
	TRenderAsset: TRenderAsset;
	LoopDisplay: LoopDisplay;
	ProResProfile: ProResProfile;
	DelayRenderScope: DelayRenderScope;
};
