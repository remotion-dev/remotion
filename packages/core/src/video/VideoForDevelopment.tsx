import React, {useEffect, useRef} from 'react';
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
		const currentTime = (currentFrame + 1) / videoConfig.fps;

		if (!playing || absoluteFrame === 0) {
			videoRef.current.currentTime = currentTime;
			return;
		}

		if (videoRef.current.paused && !videoRef.current.ended) {
			videoRef.current.currentTime = currentTime;
			videoRef.current.play();
		}
	}, [currentFrame, playing, videoConfig, absoluteFrame]);

	return <video ref={videoRef} muted {...props} />;
};
