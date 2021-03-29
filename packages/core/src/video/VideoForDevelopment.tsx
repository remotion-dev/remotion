import React, {useEffect, useRef} from 'react';
import {FEATURE_FLAG_V2_BREAKING_CHANGES} from '../feature-flags';
import {usePlayingState} from '../timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {RemotionVideoProps} from './props';

export const VideoForDevelopment: React.FC<RemotionVideoProps> = (props) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const currentFrame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();
	const videoConfig = useUnsafeVideoConfig();
	const [playing] = usePlayingState();

	useEffect(() => {
		if (playing) {
			videoRef.current?.play();
		} else {
			videoRef.current?.pause();
		}
	}, [playing]);

	useEffect(() => {
		if (!videoRef.current) {
			throw new Error('No video ref found');
		}

		if (!videoConfig) {
			throw new Error('No video config found');
		}
		const currentTime = (() => {
			if (FEATURE_FLAG_V2_BREAKING_CHANGES) {
				// In Chrome, if 30fps, the first frame is still displayed at 0.033333
				// even though after that it increases by 0.033333333 each.
				// So frame = 0 in Remotion is like frame = 1 for the browser
				return (currentFrame + 1) / videoConfig.fps;
			}

			// target middle of frame to reduce risk of rounding errors (which can cause the wrong frame to be shown)
			const msPerFrame = 1000 / videoConfig.fps;
			const msShift = msPerFrame / 2;
			return (currentFrame * msPerFrame + msShift) / 1000;
		})();

		if (!playing || absoluteFrame === 0) {
			videoRef.current.currentTime = currentTime;
		}

		if (videoRef.current.paused && !videoRef.current.ended && playing) {
			videoRef.current.currentTime = currentTime;
			videoRef.current.play();
		}
	}, [currentFrame, playing, videoConfig, absoluteFrame]);

	return <video ref={videoRef} muted {...props} />;
};
