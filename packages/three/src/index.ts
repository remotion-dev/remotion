export {ThreeCanvas, ThreeCanvasProps} from './ThreeCanvas';
import type {UseOffthreadVideoTextureOptions as UseOffthreadVideoTextureOptionsType} from './use-offthread-video-texture';
import {useOffthreadVideoTexture as useOffthreadVideoTextureType} from './use-offthread-video-texture';
import type {UseVideoTextureOptions as UseVideoTextureOptionsType} from './use-video-texture';
import {useVideoTexture as useVideoTextureType} from './use-video-texture';

/**
 * @deprecated useOffthreadVideoTexture has been deprecated.
 * Use the approach documented at https://remotion.dev/docs/videos/as-threejs-texture instead.
 */
const useOffthreadVideoTexture = useOffthreadVideoTextureType;
/**
 * @deprecated useOffthreadVideoTexture has been deprecated.
 * Use the approach documented at https://remotion.dev/docs/videos/as-threejs-texture instead.
 */
type UseOffthreadVideoTextureOptions = UseOffthreadVideoTextureOptionsType;
/**
 * @deprecated useVideoTexture has been deprecated.
 * Use the approach documented at https://remotion.dev/docs/videos/as-threejs-texture instead.
 */
const useVideoTexture = useVideoTextureType;
/**
 * @deprecated useVideoTexture has been deprecated.
 * Use the approach documented at https://remotion.dev/docs/videos/as-threejs-texture instead.
 */
type UseVideoTextureOptions = UseVideoTextureOptionsType;

export {
	useOffthreadVideoTexture,
	UseOffthreadVideoTextureOptions,
	useVideoTexture,
	UseVideoTextureOptions,
};
