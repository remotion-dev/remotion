import './asset-types';
import {TAsset, TCompMetadata} from './CompositionManager';
import {checkMultipleRemotionVersions} from './multiple-versions-warning';

declare global {
	interface Window {
		ready: boolean;
		getStaticCompositions: () => TCompMetadata[];
		remotion_setFrame: (frame: number) => void;
		remotion_collectAssets: () => TAsset[];
		remotion_isPlayer: boolean;
		remotion_imported: boolean;
	}
}

checkMultipleRemotionVersions();

export * from './AbsoluteFill';
export {AnyComponent} from './any-component';
export * from './audio';
export * from './Composition';
export {TAsset} from './CompositionManager';
export * from './config';
export {getInputProps} from './config/input-props';
export * from './easing';
export * from './IFrame';
export * from './Img';
export * from './internals';
export * from './interpolate';
export {interpolateColors} from './interpolateColors';
export * from './random';
export * from './ready-manager';
export {registerRoot} from './register-root';
export {Sequence} from './sequencing';
export * from './spring';
export * from './use-frame';
export * from './use-video-config';
export * from './video';
export * from './video-config';
