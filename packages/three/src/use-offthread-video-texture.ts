import {useLayoutEffect, useMemo, useState} from 'react';
import {
	Internals,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {Texture} from 'three';

export type UseOffthreadVideoTextureOptions = {
	src: string;
	playbackRate?: number;
	transparent?: boolean;
	toneMapped?: boolean;
	delayRenderRetries?: number;
	delayRenderTimeoutInMilliseconds?: number;
};

export const useInnerVideoTexture = ({
	playbackRate,
	src,
	transparent,
	toneMapped,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
}: {
	playbackRate: number;
	src: string;
	transparent: boolean;
	toneMapped: boolean;
	delayRenderRetries?: number;
	delayRenderTimeoutInMilliseconds?: number;
}) => {
	const videoEnabled = Internals.useVideoEnabled();
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

	const [imageTexture, setImageTexture] = useState<Texture | null>(null);
	const {delayRender, continueRender, cancelRender} = useDelayRender();

	useLayoutEffect(() => {
		if (!videoEnabled) {
			setImageTexture(null);
			return;
		}

		const handle = delayRender('fetch offthread video frame', {
			retries: delayRenderRetries,
			timeoutInMilliseconds: delayRenderTimeoutInMilliseconds,
		});
		let cancelled = false;
		let texture: Texture | null = null;
		import('three/src/loaders/TextureLoader.js')
			.then(async ({TextureLoader}) => {
				if (cancelled) {
					return;
				}

				texture = await new TextureLoader().loadAsync(offthreadVideoFrameSrc);
				if (cancelled) {
					texture.dispose();
					return;
				}

				setImageTexture(texture);
				continueRender(handle);
			})
			.catch((err) => {
				if (!cancelled) {
					cancelRender(err);
				}
			});
		return () => {
			cancelled = true;
			texture?.dispose();
			continueRender(handle);
		};
	}, [
		videoEnabled,
		offthreadVideoFrameSrc,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		delayRender,
		continueRender,
		cancelRender,
	]);

	return videoEnabled ? imageTexture : null;
};

/*
 * @description Allows you to use a video in React Three Fiber that is synchronized with Remotion's `useCurrentFrame()` using the `<OffthreadVideo>`.
 * @see [Documentation](https://www.remotion.dev/docs/use-offthread-video-texture)
 */
export function useOffthreadVideoTexture({
	src,
	playbackRate = 1,
	transparent = false,
	toneMapped = true,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
}: UseOffthreadVideoTextureOptions) {
	if (!src) {
		throw new Error('src must be provided to useOffthreadVideoTexture');
	}

	const env = useRemotionEnvironment();

	const {isRendering, isClientSideRendering} = env;

	if (isClientSideRendering) {
		throw new Error(
			'useOffthreadVideoTexture() cannot be used in client-side rendering.',
		);
	}

	if (!isRendering) {
		throw new Error(
			'useOffthreadVideoTexture() can only be used during rendering. Use useRemotionEnvironment().isRendering to render it conditionally.',
		);
	}

	return useInnerVideoTexture({
		playbackRate,
		src,
		transparent,
		toneMapped,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
	});
}
