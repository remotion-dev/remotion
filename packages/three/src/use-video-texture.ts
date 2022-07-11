import React, {useCallback, useState} from 'react';
import type {Video} from 'remotion';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';
import {VideoTexture} from 'three';

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

export const useVideoTexture = (
	videoRef: React.RefObject<HTMLVideoElement>
): VideoTexture | null => {
	const [loaded] = useState(() =>
		delayRender(`Waiting for texture in useVideoTexture() to be loaded`)
	);
	const [videoTexture, setVideoTexture] = useState<VideoTexture | null>(null);
	const frame = useCurrentFrame();

	const onReady = useCallback(() => {
		if (!videoRef.current) {
			throw new Error('Video not ready');
		}

		const vt = new VideoTexture(videoRef.current);
		videoRef.current.width = videoRef.current.videoWidth;
		videoRef.current.height = videoRef.current.videoHeight;
		setVideoTexture(vt);
		continueRender(loaded);
	}, [loaded, videoRef]);

	React.useEffect(() => {
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
	}, [loaded, onReady, videoRef]);

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
	}, [frame, loaded, videoRef]);

	if (
		typeof HTMLVideoElement === 'undefined' ||
		!HTMLVideoElement.prototype.requestVideoFrameCallback
	) {
		continueRender(loaded);
		return null;
	}

	return videoTexture;
};
