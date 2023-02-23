import './asset-types.js';
import {Clipper} from './Clipper.js';
import type {TAsset, TCompMetadata} from './CompositionManager.js';
import type {StaticFile} from './get-static-files.js';
import {useIsPlayer} from './is-player.js';
import {checkMultipleRemotionVersions} from './multiple-versions-warning.js';
import type {ClipRegion} from './NativeLayers.js';
import {Null} from './Null.js';

declare global {
	interface Window {
		ready: boolean;
		remotion_cancelledError: string | undefined;
		getStaticCompositions: () => TCompMetadata[];
		setBundleMode: (bundleMode: BundleState) => void;
		remotion_staticBase: string;
		remotion_staticFiles: StaticFile[];
		remotion_editorName: string | null;
		remotion_numberOfAudioTags: number;
		remotion_projectName: string;
		remotion_cwd: string;
		remotion_previewServerCommand: string;
		remotion_setFrame: (frame: number) => void;
		remotion_initialFrame: number;
		remotion_proxyPort: number;
		remotion_audioEnabled: boolean;
		remotion_videoEnabled: boolean;
		remotion_puppeteerTimeout: number;
		remotion_inputProps: string;
		remotion_envVariables: string;
		remotion_collectAssets: () => TAsset[];
		remotion_getClipRegion: () => ClipRegion | null;
		remotion_isPlayer: boolean;
		remotion_isBuilding: undefined | (() => void);
		remotion_finishedBuilding: undefined | (() => void);
		siteVersion: '4';
		remotion_version: string;
		remotion_imported: string | boolean;
	}
}

export type BundleState =
	| {
			type: 'index';
	  }
	| {
			type: 'evaluation';
	  }
	| {
			type: 'composition';
			compositionName: string;
			compositionDefaultProps: unknown;
			compositionHeight: number;
			compositionDurationInFrames: number;
			compositionWidth: number;
			compositionFps: number;
	  };

checkMultipleRemotionVersions();

export * from './AbsoluteFill.js';
export * from './audio';
export {cancelRender} from './cancel-render.js';
export * from './Composition.js';
export {SmallTCompMetadata, TAsset, TCompMetadata} from './CompositionManager.js';
export {Config, ConfigType} from './config';
export {getInputProps} from './config/input-props.js';
export {continueRender, delayRender} from './delay-render.js';
export * from './easing.js';
export * from './Folder.js';
export * from './freeze.js';
export {getStaticFiles, StaticFile} from './get-static-files.js';
export * from './IFrame.js';
export * from './Img.js';
export * from './internals.js';
export * from './interpolate.js';
export {interpolateColors} from './interpolate-colors.js';
export {Loop} from './loop';
export {ClipRegion} from './NativeLayers.js';
export {prefetch} from './prefetch.js';
export {random, RandomSeed} from './random.js';
export {registerRoot} from './register-root.js';
export {Sequence} from './Sequence.js';
export {Series} from './series';
export * from './spring';
export {staticFile} from './static-file.js';
export * from './Still.js';
export type {PlayableMediaTag} from './timeline-position-state.js';
export {useCurrentFrame} from './use-current-frame.js';
export * from './use-video-config.js';
export * from './version.js';
export * from './video';
export * from './video-config.js';


export const Experimental = {
	/**
	 * This is a special component that will cause Remotion to only partially capture the frame of the video. 
	 * @see [Documentation](https://www.remotion.dev/docs/clipper)
	 */
	Clipper,
	/**
	 * This is a special component, that, when rendered, will skip rendering the frame altogether.
	 * @see [Documentation](https://www.remotion.dev/docs/null)
	 */
	Null,
	useIsPlayer,
};

export type WebpackOverrideFn =
	"The 'WebpackOverrideFn' has been moved to '@remotion/bundler'. Update your imports and install '@remotion/bundler' if necessary.";
