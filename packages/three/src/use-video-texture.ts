import React, {useState} from 'react';
import type {Video} from 'remotion';
import {
	Internals,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
} from 'remotion';
// eslint-disable-next-line no-restricted-imports
import type {VideoTexture} from 'three';

export type UseVideoTextureOptions = React.ComponentProps<typeof Video>;

let warned = false;

const warnAboutRequestVideoFrameCallback = () => {
	if (warned) {
		return false;
	}

	warned = true;
	// eslint-disable-next-line no-console
	console.warn(
		'Browser does not support requestVideoFrameCallback. Cannot display video.',
	);
};

/*
 * @description Allows you to use a video in React Three Fiber that is synchronized with Remotion's useCurrentFrame().
 * @see [Documentation](https://www.remotion.dev/docs/use-video-texture)
 */
export const useVideoTexture = (
	videoRef: React.RefObject<HTMLVideoElement | null>,
): VideoTexture | null => {
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const videoEnabled = Internals.useVideoEnabled();

	const environment = useRemotionEnvironment();
	const {isClientSideRendering} = environment;

	if (isClientSideRendering) {
		throw new Error(
			'useVideoTexture() cannot be used in client side rendering.',
		);
	}

	const [videoTexture, setVideoTexture] = useState<VideoTexture | null>(null);
	const [vidText] = useState(
		() => import('three/src/textures/VideoTexture.js'),
	);
	const frame = useCurrentFrame();

	const supported =
		typeof HTMLVideoElement !== 'undefined' &&
		Boolean(HTMLVideoElement.prototype.requestVideoFrameCallback);

	React.useLayoutEffect(() => {
		if (!videoEnabled || !supported) {
			setVideoTexture(null);
			return;
		}

		const loaded = delayRender(
			`Waiting for texture in useVideoTexture() to be loaded`,
		);
		const element = videoRef.current;
		let cancelled = false;
		let texture: VideoTexture | null = null;

		const onReady = () => {
			vidText
				.then(({VideoTexture}) => {
					if (cancelled) {
						return;
					}

					if (!element) {
						throw new Error('Video not ready');
					}

					texture = new VideoTexture(element);

					element.width = element.videoWidth;
					element.height = element.videoHeight;
					setVideoTexture(texture);
					continueRender(loaded);
				})
				.catch((err) => {
					if (!cancelled) {
						cancelRender(err);
					}
				});
		};

		if (element && element.readyState >= 2) {
			onReady();
		} else {
			element?.addEventListener('loadeddata', onReady, {once: true});
		}

		return () => {
			cancelled = true;
			element?.removeEventListener('loadeddata', onReady);
			texture?.dispose();
			continueRender(loaded);
		};
	}, [
		videoEnabled,
		supported,
		vidText,
		videoRef,
		delayRender,
		continueRender,
		cancelRender,
	]);

	React.useEffect(() => {
		const {current} = videoRef;
		if (!videoEnabled || !current) {
			return;
		}

		if (!current.requestVideoFrameCallback) {
			warnAboutRequestVideoFrameCallback();
			return;
		}

		const ready = () => {
			// Now force a new render so the latest video frame shows up in the canvas
			// Allow remotion to continue
		};

		current.requestVideoFrameCallback(ready);
	}, [frame, videoEnabled, videoRef]);

	if (!supported) {
		return null;
	}

	return videoEnabled ? videoTexture : null;
};
