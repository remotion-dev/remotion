import React, {useEffect, useRef} from 'react';
import {usePlayingState} from '../timeline-position-state';
import {useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {AllowedAudioProps} from './props';

export const AudioForDevelopment: React.FC<AllowedAudioProps> = (props) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const currentFrame = useCurrentFrame();
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
		}
		if (!playing /**1 */ || timeShift > 0.5 /**2 */) {
			// If scrubbing around, adjust timing
			// or if time shift is bigger than 0.2sec
			audioRef.current.currentTime = currentFrame / videoConfig.fps;
		}
		if (currentFrame === 0 && playing) {
			// If video ended, play it again
			audioRef.current.play();
		}
	}, [currentFrame, playing, videoConfig]);

	return <audio ref={audioRef} {...props} />;
};
