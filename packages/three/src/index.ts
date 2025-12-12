export {ThreeCanvas, ThreeCanvasProps} from './ThreeCanvas';

/**
 * @deprecated useOffthreadVideoTexture has been deprecated.
 * Use the approach documented at https://remotion.dev/docs/videos/as-threejs-texture instead.
 */
export type {UseOffthreadVideoTextureOptions} from './use-offthread-video-texture';
/**
 * @deprecated useOffthreadVideoTexture has been deprecated.
 * Use the approach documented at https://remotion.dev/docs/videos/as-threejs-texture instead.
 */
export const useOffthreadVideoTexture = () => {
	throw new Error(
		'useOffthreadVideoTexture has been deprecated. Please see https://remotion.dev/docs/videos/as-threejs-texture for alternatives.',
	);
};

/**
 * @deprecated useVideoTexture has been deprecated.
 * Use the approach documented at https://remotion.dev/docs/videos/as-threejs-texture instead.
 */
export type {UseVideoTextureOptions} from './use-video-texture';
/**
 * @deprecated useVideoTexture has been deprecated.
 * Use the approach documented at https://remotion.dev/docs/videos/as-threejs-texture for alternatives.
 */
export const useVideoTexture = () => {
	throw new Error(
		'useVideoTexture has been deprecated. Please see https://remotion.dev/docs/videos/as-threejs-texture for alternatives.',
	);
};
