import { useThree } from '@react-three/fiber';
import React, { useCallback } from 'react';
import { continueRender, delayRender, useCurrentFrame, Video } from 'remotion';
import { VideoTexture } from 'three';
import { useRemotionThreeDomNode } from './ThreeContext';

declare global {
	interface HTMLVideoElement {
		requestVideoFrameCallback?: (cb: () => void) => void;
	}
}

export type UseVideoTextureOptions = React.ComponentProps<typeof Video>;

export const useVideoTexture = (videoProps: UseVideoTextureOptions) => {
	const render = useThree((s) => s.invalidate);

	const videoRef = React.useRef<HTMLVideoElement | null>(null);
	const [videoTexture, setVideoTexture] = React.useState<VideoTexture | null>(
		null
	);

	const onLoadedData = useCallback(() => {
		const { current } = videoRef;
		if (!current) {
			throw new Error('No video ref found');
		}
		const vt = new VideoTexture(current);
		current.width = current.videoWidth;
		current.height = current.videoHeight;
		vt.needsUpdate = true;
		setVideoTexture(vt);
	}, []);

	const frame = useCurrentFrame();
	React.useEffect(() => {
		const video = videoRef.current;
		if (!video || !videoTexture) {
			return;
		}
		if (!video.requestVideoFrameCallback) {
			throw new Error(
				'HTMLVideoElement.requestVideoFrameCallback not supported'
			);
		}
		const handle = delayRender();
		// wait for the video to render its next frame
		video.requestVideoFrameCallback(() => {
			// Now force a new render so the latest video frame shows up in the canvas
			render();
			// Allow remotion to continue
			continueRender(handle);
		});
	}, [frame, render, videoTexture]);

	useRemotionThreeDomNode(
		<Video
			{...videoProps}
			ref={videoRef}
			onLoadedData={onLoadedData}
			crossOrigin="anonymous"
			style={{ width: 800, height: 500 }}
		/>
	);

	return videoTexture;
};
