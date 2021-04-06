import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {CompositionManager} from '../CompositionManager';
import {getAssetFileName} from '../get-asset-file-name';
import {useNonce} from '../nonce';
import {SequenceContext} from '../sequencing';
import {TimelineContext, usePlayingState} from '../timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useMediaPlayback} from '../use-media-playback';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {evaluateVolume} from '../volume-prop';
import {RemotionAudioProps} from './props';
import {useAudioFrame, useAudioStartsAt} from './use-audio-frame';

export const AudioForDevelopment: React.FC<RemotionAudioProps> = (props) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const frame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();
	const nonce = useNonce();

	const audioFrame = useAudioFrame();
	const videoConfig = useUnsafeVideoConfig();
	const [playing] = usePlayingState();

	const {rootId} = useContext(TimelineContext);
	const parentSequence = useContext(SequenceContext);
	const actualFrom = parentSequence
		? parentSequence.relativeFrom + parentSequence.cumulatedFrom
		: 0;
	const startsAt = useAudioStartsAt();
	const {registerSequence, unregisterSequence} = useContext(CompositionManager);
	const [id] = useState(() => String(Math.random()));
	const {volume, ...nativeProps} = props;

	useEffect(() => {
		if (playing) {
			audioRef.current?.play();
		} else {
			audioRef.current?.pause();
		}
	}, [playing]);

	const actualVolume = useMediaTagVolume(audioRef);

	useSyncVolumeWithMediaTag({
		audioFrame,
		actualVolume,
		volume,
		mediaRef: audioRef,
	});

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
			nonce,
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
		nonce,
	]);

	useMediaPlayback({
		mediaRef: audioRef,
		absoluteFrame,
		frame,
		playing,
		videoConfig,
		src: nativeProps.src,
		mediaType: 'audio',
	});

	return <audio ref={audioRef} {...nativeProps} />;
};
