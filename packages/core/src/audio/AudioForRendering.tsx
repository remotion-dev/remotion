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
import {evaluateVolume} from '../volume-prop';
import {RemotionAudioProps} from './props';
import {useFrameForVolumeProp} from './use-audio-frame';
import {uint8ToBase64} from './audio-url-helpers';

const AudioForRenderingRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLAudioElement,
	RemotionAudioProps
> = (props, ref) => {
	const audioRef = useRef<HTMLAudioElement>(null);

	const absoluteFrame = useAbsoluteCurrentFrame();
	const volumePropFrame = useFrameForVolumeProp();
	const frame = useCurrentFrame();
	const sequenceContext = useContext(SequenceContext);
	const {registerAsset, unregisterAsset} = useContext(CompositionManager);
	const { fromAudioBuffer } = props;

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`audio-${random(props.src ?? '')}-${sequenceContext?.relativeFrom}-${
				sequenceContext?.cumulatedFrom
			}-${sequenceContext?.durationInFrames}-muted:${props.muted}`,
		[props.muted, props.src, sequenceContext]
	);

	const audioSrc = useMemo(() => {
		if (fromAudioBuffer) {
			const arrayBufferAsBase64 = uint8ToBase64(fromAudioBuffer);
			return 'data:audio/wav;base64,' + arrayBufferAsBase64;
		}

		return props.src;
	}, [fromAudioBuffer, props.src])

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
		if (!audioSrc) {
			throw new Error('No src passed');
		}

		if (props.muted) {
			return;
		}

		registerAsset({
			type: 'audio',
			src: getAbsoluteSrc(audioSrc),
			id,
			frame: absoluteFrame,
			volume,
			isRemote: props.fromAudioBuffer
				? true
				: isRemoteAsset(getAbsoluteSrc(audioSrc)),
			mediaFrame: frame,
			playbackRate: props.playbackRate ?? 1,
		});
		return () => unregisterAsset(id);
	}, [
		props.muted,
		audioSrc,
		registerAsset,
		absoluteFrame,
		id,
		unregisterAsset,
		volume,
		volumePropFrame,
		frame,
		playbackRate,
		props.playbackRate,
		props.fromAudioBuffer,
	]);

	const propsToPass = {
		...nativeProps,
		src: audioSrc
	}

	return <audio ref={audioRef} {...propsToPass} />;
};

export const AudioForRendering = forwardRef(
	AudioForRenderingRefForwardingFunction
);
