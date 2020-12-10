import React, {useEffect, useRef} from 'react';
import {usePlayingState} from '../timeline-position-state';
import {useCurrentFrame} from '../use-frame';
import {useVideoConfig} from '../use-video-config';
import {AllowedAudioProps} from './props';

export const AudioForDevelopment: React.FC<AllowedAudioProps> = (props) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const currentFrame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const [playing] = usePlayingState();

	useEffect(() => {
		if (playing) {
			audioRef.current?.play();
		} else {
			audioRef.current?.pause();
		}
	}, [playing]);

	useEffect(() => {
		if (!audioRef.current) {
			throw new Error('No audio ref found');
		}
		if (!playing || currentFrame === 0) {
			audioRef.current.currentTime = currentFrame / (1000 / videoConfig.fps);
		}
	}, [currentFrame, playing, videoConfig.fps]);

	return <audio ref={audioRef} {...props} />;
};
