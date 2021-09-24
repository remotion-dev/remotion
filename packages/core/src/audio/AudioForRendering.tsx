import React, {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import {getAbsoluteSrc} from '../absolute-src';
import {CompositionManager} from '../CompositionManager';
import {isRemoteAsset} from '../is-remote-asset';
import {random} from '../random';
import {SequenceContext} from '../sequencing';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useMediaHasMetadata} from '../use-media-metadata';
import {evaluateVolume} from '../volume-prop';
import {RemotionAudioProps} from './props';
import {useFrameForVolumeProp} from './use-audio-frame';

const AudioForRenderingRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLAudioElement,
	RemotionAudioProps
> = (props, ref) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const {currentSrc} = audioRef.current || {};
	const hasMetadata = useMediaHasMetadata(audioRef);

	const absoluteFrame = useAbsoluteCurrentFrame();
	const volumePropFrame = useFrameForVolumeProp();
	const frame = useCurrentFrame();
	const sequenceContext = useContext(SequenceContext);
	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`audio-${random(currentSrc ?? '')}-${sequenceContext?.relativeFrom}-${
				sequenceContext?.cumulatedFrom
			}-${sequenceContext?.durationInFrames}-muted:${props.muted}`,
		[props.muted, currentSrc, sequenceContext]
	);

	const {volume: volumeProp, playbackRate, ...nativeProps} = props;

	const volume = evaluateVolume({
		volume: volumeProp,
		frame: volumePropFrame,
		mediaVolume: 1,
	});

	useImperativeHandle(ref, () => {
		return audioRef.current as HTMLVideoElement;
	});

	useEffect(() => {
		if (props.muted) {
			return;
		}

		if (!audioRef.current || !hasMetadata) {
			return;
		}

		if (!audioRef.current.currentSrc) {
			throw new Error(
				`No src found. Please provide a src prop or a <source> child to the Audio element.`
			);
		}

		registerAsset({
			type: 'audio',
			src: getAbsoluteSrc(audioRef.current.currentSrc),
			id,
			frame: absoluteFrame,
			volume,
			isRemote: isRemoteAsset(getAbsoluteSrc(audioRef.current.currentSrc)),
			mediaFrame: frame,
			playbackRate: props.playbackRate ?? 1,
		});
		return () => unregisterAsset(id);
	}, [
		props.muted,
		registerAsset,
		absoluteFrame,
		id,
		unregisterAsset,
		volume,
		volumePropFrame,
		frame,
		playbackRate,
		props.playbackRate,
		hasMetadata,
	]);

	return <audio ref={audioRef} {...nativeProps} />;
};

export const AudioForRendering = forwardRef(
	AudioForRenderingRefForwardingFunction
);
