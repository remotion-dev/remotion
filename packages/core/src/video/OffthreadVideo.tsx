import React, {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
import {getAbsoluteSrc} from '../absolute-src';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from '../audio/use-audio-frame';
import {CompositionManager} from '../CompositionManager';
import {Img} from '../Img';
import {random} from '../random';
import {SequenceContext} from '../sequencing';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {evaluateVolume} from '../volume-prop';
import {getExpectedMediaFrameUncorrected} from './get-current-time';
import {RemotionOffthreadVideoProps} from './props';

const OffthreadVideoForRenderingForwardFunction: React.ForwardRefRenderFunction<
	HTMLImageElement,
	RemotionOffthreadVideoProps
> = ({onError, volume: volumeProp, playbackRate, src, ...props}, ref) => {
	const absoluteFrame = useAbsoluteCurrentFrame();

	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp();
	const videoConfig = useUnsafeVideoConfig();
	const imageRef = useRef<HTMLImageElement>(null);
	const sequenceContext = useContext(SequenceContext);
	const mediaStartsAt = useMediaStartsAt();

	useImperativeHandle(ref, () => {
		return imageRef.current as HTMLImageElement;
	});
	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	if (!src) {
		throw new TypeError('No `src` was passed to <OffthreadVideo>.');
	}

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`video-${random(src ?? '')}-${sequenceContext?.cumulatedFrom}-${
				sequenceContext?.relativeFrom
			}-${sequenceContext?.durationInFrames}-muted:${props.muted}`,
		[
			src,
			props.muted,
			sequenceContext?.cumulatedFrom,
			sequenceContext?.relativeFrom,
			sequenceContext?.durationInFrames,
		]
	);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	const volume = evaluateVolume({
		volume: volumeProp,
		frame: volumePropsFrame,
		mediaVolume: 1,
	});

	useEffect(() => {
		if (!src) {
			throw new Error('No src passed');
		}

		if (props.muted) {
			return;
		}

		registerAsset({
			type: 'video',
			src: getAbsoluteSrc(src),
			id,
			frame: absoluteFrame,
			volume,
			mediaFrame: frame,
			playbackRate: playbackRate ?? 1,
		});

		return () => unregisterAsset(id);
	}, [
		props.muted,
		src,
		registerAsset,
		id,
		unregisterAsset,
		volume,
		frame,
		absoluteFrame,
		playbackRate,
	]);

	const currentTime = useMemo(() => {
		return (
			getExpectedMediaFrameUncorrected({
				frame,
				playbackRate: playbackRate || 1,
				startFrom: -mediaStartsAt,
			}) / videoConfig.fps
		);
	}, [frame, mediaStartsAt, playbackRate, src, videoConfig.fps]);

	const actualSrc = useMemo(() => {
		return `http://localhost:9999/proxy?src=${encodeURIComponent(
			getAbsoluteSrc(src)
		)}&time=${encodeURIComponent(currentTime)}`;
	}, [currentTime, src]);

	return <Img ref={imageRef} src={actualSrc} {...props} onError={onError} />;
};

export const OffthreadVideo = forwardRef(
	OffthreadVideoForRenderingForwardFunction
);
