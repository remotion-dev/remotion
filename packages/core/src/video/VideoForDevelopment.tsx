import React, {useEffect, useRef} from 'react';
import {usePlayingState} from '../timeline-position-state';
import {useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {RemotionVideoProps} from './props';

export const VideoForDevelopment: React.FC<RemotionVideoProps> = (props) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const currentFrame = useCurrentFrame();
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

		if (!playing) {
			videoRef.current.currentTime = currentFrame / (1000 / videoConfig.fps);
			return;
		}

		if (currentFrame === 0 && playing) {
			videoRef.current.currentTime = 0;
			videoRef.current?.play();
		}
	}, [currentFrame, playing, videoConfig]);

	return <video ref={videoRef} muted {...props} />;
};
