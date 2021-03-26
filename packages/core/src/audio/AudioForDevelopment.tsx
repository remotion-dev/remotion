import React, {useContext, useEffect, useRef, useState} from 'react';
import {CompositionManager} from '../CompositionManager';
import {getAssetFileName} from '../get-asset-file-name';
import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {SequenceContext} from '../sequencing';
import {TimelineContext, usePlayingState} from '../timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {validateMediaProps} from '../validate-media-props';
import {RemotionAudioProps} from './props';

export const AudioForDevelopment: React.FC<RemotionAudioProps> = (props) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const currentFrame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();
	const startsAt = absoluteFrame - currentFrame;
	const [actualVolume, setActualVolume] = useState(1);

	const videoConfig = useUnsafeVideoConfig();
	const [playing] = usePlayingState();
	const {isThumbnail} = useContext(TimelineContext);

	const parentSequence = useContext(SequenceContext);
	const actualFrom = parentSequence?.from ?? 0;

	const {registerSequence, unregisterSequence} = useContext(CompositionManager);

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
		return () => ref.removeEventListener('volumechange', onChange);
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
		if (!videoConfig) {
			return;
		}

		if (!props.src) {
			throw new Error('No src passed');
		}

		const duration = parentSequence
			? Math.min(parentSequence.durationInFrames, videoConfig.durationInFrames)
			: videoConfig.durationInFrames;

		registerSequence({
			type: 'audio',
			src: props.src,
			id,
			// TODO: Cap to audio duration
			duration,
			from: actualFrom,
			parent: parentSequence?.id ?? null,
			displayName: getAssetFileName(props.src),
			isThumbnail,
		});
		return () => unregisterSequence(id);
	}, [
		props.src,
		id,
		currentFrame,
		parentSequence,
		actualVolume,
		userPreferredVolume,
		registerSequence,
		unregisterSequence,
		videoConfig,
		actualFrom,
		isThumbnail,
		startsAt,
	]);

	useEffect(() => {
		if (!audioRef.current) {
			throw new Error('No audio ref found');
		}
		if (!videoConfig) {
			throw new Error(
				'No video config found. <Audio> must be placed inside a composition.'
			);
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
