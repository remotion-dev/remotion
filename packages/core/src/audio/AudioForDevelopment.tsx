import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {CompositionManager} from '../CompositionManager';
import {getAssetFileName} from '../get-asset-file-name';
import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {SequenceContext} from '../sequencing';
import {TimelineContext, usePlayingState} from '../timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {evaluateVolume} from '../volume-prop';
import {RemotionAudioProps} from './props';

export const AudioForDevelopment: React.FC<RemotionAudioProps> = (props) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const frame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();
	const [actualVolume, setActualVolume] = useState(1);

	const videoConfig = useUnsafeVideoConfig();
	const [playing] = usePlayingState();
	const {rootId} = useContext(TimelineContext);

	const parentSequence = useContext(SequenceContext);
	const actualFrom = parentSequence
		? parentSequence.relativeFrom + parentSequence.cumulatedFrom
		: 0;

	const startsAt = Math.min(0, parentSequence?.relativeFrom ?? 0);

	const {registerSequence, unregisterSequence} = useContext(CompositionManager);

	const [id] = useState(() => String(Math.random()));

	const {volume, ...nativeProps} = props;

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

	useEffect(() => {
		const userPreferredVolume = evaluateVolume({
			frame: frame + startsAt,
			volume,
		});
		if (
			!isApproximatelyTheSame(userPreferredVolume, actualVolume) &&
			audioRef.current
		) {
			audioRef.current.volume = userPreferredVolume;
		}
	}, [actualVolume, frame, props.volume, startsAt, volume]);

	useEffect(() => {
		if (playing) {
			audioRef.current?.play();
		} else {
			audioRef.current?.pause();
		}
	}, [playing]);

	const duration = (() => {
		if (!videoConfig) {
			return 0;
		}
		return parentSequence
			? Math.min(parentSequence.durationInFrames, videoConfig.durationInFrames)
			: videoConfig.durationInFrames;
	})();

	const volumes: string | number = useMemo(() => {
		if (typeof props.volume === 'number') {
			return props.volume;
		}

		const negativeShift = Math.min(0, parentSequence?.parentFrom ?? 0);
		return new Array(duration + startsAt + negativeShift)
			.fill(true)
			.map((_, i) => {
				return evaluateVolume({
					frame: i - negativeShift,
					volume,
				});
			})
			.join(',');
	}, [duration, parentSequence, props.volume, startsAt, volume]);

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

		registerSequence({
			type: 'audio',
			src: props.src,
			id,
			// TODO: Cap to audio duration
			duration,
			from: 0,
			parent: parentSequence?.id ?? null,
			displayName: getAssetFileName(props.src),
			rootId,
			volume: volumes,
			showInTimeline: true,
		});
		return () => unregisterSequence(id);
	}, [
		actualFrom,
		duration,
		id,
		parentSequence,
		props.src,
		registerSequence,
		rootId,
		unregisterSequence,
		videoConfig,
		volumes,
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
		const shouldBeTime = frame / videoConfig.fps;

		const isTime = audioRef.current.currentTime;
		const timeShift = Math.abs(shouldBeTime - isTime);
		if (timeShift > 0.2 && !audioRef.current.ended) {
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
			// Play audio
			audioRef.current.play();
		}
	}, [absoluteFrame, frame, playing, videoConfig]);

	return <audio ref={audioRef} {...nativeProps} />;
};
