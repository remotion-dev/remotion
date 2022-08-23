import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {getAbsoluteSrc} from '../absolute-src';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from '../audio/use-audio-frame';
import {CompositionManager} from '../CompositionManager';
import {OFFTHREAD_VIDEO_CLASS_NAME} from '../default-css';
import {Img} from '../Img';
import {Internals} from '../internals';
import {random} from '../random';
import {SequenceContext} from '../Sequence';
import {useTimelinePosition} from '../timeline-position-state';
import {useCurrentFrame} from '../use-current-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {evaluateVolume} from '../volume-prop';
import {getExpectedMediaFrameUncorrected} from './get-current-time';
import type {OffthreadVideoImageFormat, OffthreadVideoProps} from './props';

const DEFAULT_IMAGE_FORMAT: OffthreadVideoImageFormat = 'jpeg';

export const OffthreadVideoForRendering: React.FC<OffthreadVideoProps> = ({
	onError,
	volume: volumeProp,
	playbackRate,
	src,
	muted,
	imageFormat,
	...props
}) => {
	const absoluteFrame = useTimelinePosition();

	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp();
	const videoConfig = useUnsafeVideoConfig();
	const sequenceContext = useContext(SequenceContext);
	const mediaStartsAt = useMediaStartsAt();

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
			}-${sequenceContext?.durationInFrames}-muted:${muted}`,
		[
			src,
			muted,
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

		if (!window.remotion_videoEnabled) {
			return;
		}

		if (muted) {
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
		muted,
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
	}, [frame, mediaStartsAt, playbackRate, videoConfig.fps]);

	const actualSrc = useMemo(() => {
		return `http://localhost:${
			window.remotion_proxyPort
		}/proxy?src=${encodeURIComponent(
			getAbsoluteSrc(src)
		)}&time=${encodeURIComponent(currentTime)}&imageFormat=${
			imageFormat ?? DEFAULT_IMAGE_FORMAT
		}`;
	}, [currentTime, imageFormat, src]);

	const onErr: React.ReactEventHandler<HTMLVideoElement | HTMLImageElement> =
		useCallback(
			(e) => {
				onError?.(e);
			},
			[onError]
		);

	const className = useMemo(() => {
		return [OFFTHREAD_VIDEO_CLASS_NAME, props.className]
			.filter(Internals.truthy)
			.join(' ');
	}, [props.className]);

	return (
		<Img src={actualSrc} className={className} {...props} onError={onErr} />
	);
};
