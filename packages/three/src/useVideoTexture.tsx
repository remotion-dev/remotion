import { useThree } from '@react-three/fiber';
import React from 'react';
import { continueRender, delayRender, useCurrentFrame, Video } from 'remotion';
import { VideoTexture } from 'three';
import { useRemotionThreeDomNode } from './RemotionThreeContext';

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

	const videoWrapperRef = React.useCallback(
		(wrapper: HTMLDivElement | null) => {
			if (wrapper) {
				const video = (videoRef.current = wrapper.firstChild as HTMLVideoElement);
				video.addEventListener('loadeddata', () => {
					const vt = new VideoTexture(video);
					video.width = video.videoWidth;
					video.height = video.videoHeight;
					vt.needsUpdate = true;
					setVideoTexture(vt);
				});
			} else {
				videoRef.current = null;
			}
		},
		[]
	);

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
	}, [frame]);

	useRemotionThreeDomNode(
		// TODO: Remove wrapper once Video supports ref
		<div ref={videoWrapperRef}>
			<Video
				crossOrigin="anonymous"
				{...videoProps}
				style={{ width: 800, height: 500 }}
			/>
		</div>
	);

	return videoTexture;
};
