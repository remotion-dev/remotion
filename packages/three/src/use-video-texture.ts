import React, {useCallback, useState} from 'react';
import type {Video} from 'remotion';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';
import type {VideoTexture} from 'three/src/textures/VideoTexture';

export type UseVideoTextureOptions = React.ComponentProps<typeof Video>;

let warned = false;

const warnAboutRequestVideoFrameCallback = () => {
	if (warned) {
		return false;
	}

	warned = true;
	console.warn(
		'Browser does not support requestVideoFrameCallback. Cannot display video.'
	);
};

/**
 * @description Allows you to use a video in React Three Fiber that is synchronized with Remotion's useCurrentFrame().
 * @see [Documentation](https://www.remotion.dev/docs/use-video-texture)
 */
export const useVideoTexture = (
	videoRef: React.RefObject<HTMLVideoElement>
): VideoTexture | null => {
	const [handle] = useState(() =>
		delayRender(`Waiting for texture in useVideoTexture() to be loaded`)
	);
	const [videoTexture, setVideoTexture] = useState<VideoTexture | null>(null);
	const [vidText] = useState(
		() => import('three/src/textures/VideoTexture.js')
	);
	const [error, setErr] = useState<null | Error>(null);
	const frame = useCurrentFrame();

	if (error) {
		throw error;
	}

	const onReady = useCallback(() => {
		vidText
			.then(({VideoTexture}) => {
				if (!videoRef.current) {
					throw new Error('Video not ready');
				}

				const vt = new VideoTexture(videoRef.current);
				videoRef.current.width = videoRef.current.videoWidth;
				videoRef.current.height = videoRef.current.videoHeight;
				setVideoTexture(vt);
				continueRender(handle);
			})
			.catch((err) => {
				setErr(err);
				console.error(err);
			});
	}, [handle, vidText, videoRef]);

	React.useEffect(() => {
		if (typeof document === 'undefined') {
			// Do not trigger onReady in SSR
			continueRender(handle);
			return;
		}

		if (!videoRef.current) {
			return;
		}

		if (videoRef.current.readyState >= 2) {
			onReady();
			return;
		}

		videoRef.current.addEventListener(
			'loadeddata',
			() => {
				onReady();
			},
			{once: true}
		);
	}, [handle, onReady, videoRef]);

	React.useEffect(() => {
		const {current} = videoRef;
		if (!current) {
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
	}, [frame, handle, videoRef]);

	if (
		typeof HTMLVideoElement === 'undefined' ||
		!HTMLVideoElement.prototype.requestVideoFrameCallback
	) {
		continueRender(handle);
		return null;
	}

	return videoTexture;
};
