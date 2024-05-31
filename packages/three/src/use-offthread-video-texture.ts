import {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {
	Internals,
	cancelRender,
	continueRender,
	delayRender,
	getRemotionEnvironment,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';

export type UseOffthreadVideoTextureOptions = {
	src: string;
	playbackRate?: number;
	transparent?: boolean;
	toneMapped?: boolean;
};

export const useInnerVideoTexture = ({
	playbackRate,
	src,
	transparent,
	toneMapped,
}: {
	playbackRate: number;
	src: string;
	transparent: boolean;
	toneMapped: boolean;
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const mediaStartsAt = Internals.useMediaStartsAt();

	const currentTime = useMemo(() => {
		return (
			NoReactInternals.getExpectedMediaFrameUncorrected({
				frame,
				playbackRate,
				startFrom: -mediaStartsAt,
			}) / fps
		);
	}, [frame, playbackRate, mediaStartsAt, fps]);

	const offthreadVideoFrameSrc = useMemo(() => {
		return NoReactInternals.getOffthreadVideoSource({
			currentTime,
			src,
			transparent,
			toneMapped,
		});
	}, [toneMapped, currentTime, src, transparent]);

	const [textLoaderPromise] = useState(
		() => import('three/src/loaders/TextureLoader.js'),
	);

	const [imageTexture, setImageTexture] = useState<THREE.Texture | null>(null);

	const fetchTexture = useCallback(() => {
		const imageTextureHandle = delayRender('fetch offthread video frame');

		let textureLoaded: THREE.Texture | null = null;
		let cleanedUp = false;

		textLoaderPromise.then((loader) => {
			new loader.TextureLoader()
				.loadAsync(offthreadVideoFrameSrc)
				.then((texture) => {
					textureLoaded = texture;
					if (cleanedUp) {
						return;
					}

					setImageTexture(texture);
					continueRender(imageTextureHandle);
				})
				.catch((err) => {
					cancelRender(err);
				});
		});

		return () => {
			cleanedUp = true;
			textureLoaded?.dispose();
			continueRender(imageTextureHandle);
		};
	}, [offthreadVideoFrameSrc, textLoaderPromise]);

	useLayoutEffect(() => {
		const cleanup = fetchTexture();

		return () => {
			cleanup();
		};
	}, [offthreadVideoFrameSrc, fetchTexture]);

	return imageTexture;
};

/**
 * @description Allows you to use a video in React Three Fiber that is synchronized with Remotion's `useCurrentFrame()` using the `<OffthreadVideo>`.
 * @see [Documentation](https://remotion.dev/docs/use-offthread-video-texture)
 * @param {UseOffthreadVideoTextureOptions} options Configuration options including the video source (`src`), playback rate (`playbackRate`), transparency (`transparent`), and tone mapping (`toneMapped`).
 * @returns {THREE.Texture | null} A THREE.Texture if available, otherwise null. To be used as a texture in 3D objects in React Three Fiber.
 */
export function useOffthreadVideoTexture({
	src,
	playbackRate = 1,
	transparent = false,
	toneMapped = true,
}: UseOffthreadVideoTextureOptions) {
	if (!src) {
		throw new Error('src must be provided to useOffthreadVideoTexture');
	}

	const {isRendering} = getRemotionEnvironment();
	if (!isRendering) {
		throw new Error(
			'useOffthreadVideoTexture() can only be used during rendering. Use getRemotionEnvironment().isRendering to render it conditionally.',
		);
	}

	return useInnerVideoTexture({playbackRate, src, transparent, toneMapped});
}
