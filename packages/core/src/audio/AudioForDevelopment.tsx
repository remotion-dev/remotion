import React, {useContext, useEffect, useRef, useState} from 'react';
import {CompositionManager} from '../CompositionManager';
import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {SequenceContext} from '../sequencing';
import {usePlayingState} from '../timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {validateMediaProps} from '../validate-media-props';
import {RemotionAudioProps} from './props';

export const AudioForDevelopment: React.FC<RemotionAudioProps> = (props) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const currentFrame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();
	const [actualVolume, setActualVolume] = useState(1);

	const videoConfig = useUnsafeVideoConfig();
	const [playing] = usePlayingState();
	const parentSequence = useContext(SequenceContext);

	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	const [id] = useState(() => String(Math.random()));

	validateMediaProps(props, 'Audio');

	const {volume, ...nativeProps} = props;

	useEffect(() => {
		if (!audioRef.current) {
			return;
		}
		audioRef.current.volume = volume ?? 1;
	}, [volume]);

	useEffect(() => {
		const ref = audioRef.current;
		if (!ref) {
			return;
		}
		if (ref.volume !== actualVolume) {
			setActualVolume(ref.volume);
			return;
		}
		const onChange = () => {
			setActualVolume(ref.volume);
		};
		ref.addEventListener('volumechange', onChange);
		return () => ref.addEventListener('volumechange', onChange);
	}, [actualVolume]);

	const userPreferredVolume = props.volume ?? 1;

	useEffect(() => {
		if (
			!isApproximatelyTheSame(userPreferredVolume, actualVolume) &&
			audioRef.current
		) {
			audioRef.current.volume = userPreferredVolume;
		}
	}, [actualVolume, props.volume, userPreferredVolume]);

	useEffect(() => {
		if (playing) {
			audioRef.current?.play();
		} else {
			audioRef.current?.pause();
		}
	}, [playing]);

	useEffect(() => {
		if (!audioRef.current) {
			return;
		}
		if (!props.src) {
			throw new Error('No src passed');
		}
		// Currently we only show audio in the timeline
		// that is **not inside a sequence**.
		if (parentSequence) {
			return;
		}

		registerAsset({
			type: 'audio',
			src: props.src,
			id,
			sequenceFrame: currentFrame,
			volume: userPreferredVolume,
		});
		return () => unregisterAsset(id);
	}, [
		props.src,
		registerAsset,
		id,
		unregisterAsset,
		currentFrame,
		parentSequence,
		actualVolume,
		userPreferredVolume,
	]);

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

	return <audio ref={audioRef} {...nativeProps} />;
};
