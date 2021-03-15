import React, {useEffect, useRef} from 'react';
import {usePlayingState} from '../timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {RemotionAudioProps} from './props';

export const AudioForDevelopment: React.FC<RemotionAudioProps> = (props) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const currentFrame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();

	const videoConfig = useUnsafeVideoConfig();
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
		if (!videoConfig) {
			throw new Error('No video config found');
		}
		const shouldBeTime = currentFrame / videoConfig.fps;

		const isTime = audioRef.current.currentTime;
		const timeShift = Math.abs(shouldBeTime - isTime);
		if (timeShift > 0.5) {
			console.log('Time has shifted by', timeShift, 'sec. Fixing...');
			// If scrubbing around, adjust timing
			// or if time shift is bigger than 0.2sec
			audioRef.current.currentTime = shouldBeTime;
		}

		if (!playing || absoluteFrame === 0) {
			// If scrubbing around, adjust timing
			// or if time shift is bigger than 0.2sec
			audioRef.current.currentTime = shouldBeTime;
		}
		if (audioRef.current.paused && !audioRef.current.ended && playing) {
			// Play video
			audioRef.current.play();
		}
	}, [absoluteFrame, currentFrame, playing, videoConfig]);

	return <audio ref={audioRef} {...props} />;
};
