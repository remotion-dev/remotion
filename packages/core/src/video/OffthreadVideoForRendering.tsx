import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {getAbsoluteSrc} from '../absolute-src.js';
import {AssetManager} from '../AssetManager.js';
import {
	useFrameForVolumeProp,
	useMediaStartsAt,
} from '../audio/use-audio-frame.js';
import {OFFTHREAD_VIDEO_CLASS_NAME} from '../default-css.js';
import {Img} from '../Img.js';
import {random} from '../random.js';
import {SequenceContext} from '../SequenceContext.js';
import {useTimelinePosition} from '../timeline-position-state.js';
import {truthy} from '../truthy.js';
import {useCurrentFrame} from '../use-current-frame.js';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config.js';
import {evaluateVolume} from '../volume-prop.js';
import {getExpectedMediaFrameUncorrected} from './get-current-time.js';
import type {OffthreadVideoProps} from './props.js';

export const OffthreadVideoForRendering: React.FC<OffthreadVideoProps> = ({
	onError,
	volume: volumeProp,
	playbackRate,
	src,
	muted,
	allowAmplificationDuringRender,
	transparent = false,
	...props
}) => {
	const absoluteFrame = useTimelinePosition();

	const frame = useCurrentFrame();
	const volumePropsFrame = useFrameForVolumeProp();
	const videoConfig = useUnsafeVideoConfig();
	const sequenceContext = useContext(SequenceContext);
	const mediaStartsAt = useMediaStartsAt();

	const {registerAsset, unregisterAsset} = useContext(AssetManager);

	if (!src) {
		throw new TypeError('No `src` was passed to <OffthreadVideo>.');
	}

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`offthreadvideo-${random(src ?? '')}-${sequenceContext?.cumulatedFrom}-${
				sequenceContext?.relativeFrom
			}-${sequenceContext?.durationInFrames}`,
		[
			src,
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
		allowAmplificationDuringRender: allowAmplificationDuringRender ?? false,
	});

	useEffect(() => {
		if (!src) {
			throw new Error('No src passed');
		}

		if (!window.remotion_audioEnabled) {
			return;
		}

		if (muted) {
			return;
		}

		if (volume <= 0) {
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
			allowAmplificationDuringRender: allowAmplificationDuringRender ?? false,
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
		allowAmplificationDuringRender,
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
		)}&time=${encodeURIComponent(currentTime)}&transparent=${String(
			transparent
		)}`;
	}, [currentTime, src, transparent]);

	const onErr: React.ReactEventHandler<HTMLVideoElement | HTMLImageElement> =
		useCallback(
			(e) => {
				onError?.(e);
			},
			[onError]
		);

	const className = useMemo(() => {
		return [OFFTHREAD_VIDEO_CLASS_NAME, props.className]
			.filter(truthy)
			.join(' ');
	}, [props.className]);

	return (
		<Img src={actualSrc} className={className} {...props} onError={onErr} />
	);
};
