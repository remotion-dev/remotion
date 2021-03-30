import React, {useContext, useEffect, useMemo, useRef} from 'react';
import {CompositionManager} from '../CompositionManager';
import {FEATURE_FLAG_V2_BREAKING_CHANGES} from '../feature-flags';
import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {isRemoteAsset} from '../is-remote-asset';
import {random} from '../random';
import {continueRender, delayRender} from '../ready-manager';
import {SequenceContext} from '../sequencing';
import {useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {evaluateVolume} from '../volume-prop';
import {RemotionVideoProps} from './props';

export const VideoForRendering: React.FC<RemotionVideoProps> = ({
	onError,
	...props
}) => {
	const frame = useCurrentFrame();
	const videoConfig = useUnsafeVideoConfig();
	const videoRef = useRef<HTMLVideoElement>(null);
	const sequenceContext = useContext(SequenceContext);

	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	// Generate a string that's as unique as possible for this asset
	// but at the same time the same on all threads
	const id = useMemo(
		() =>
			`audio-${random(props.src ?? '')}-${sequenceContext?.from}-${
				sequenceContext?.durationInFrames
			}-muted:${props.muted}`,
		[
			props.muted,
			props.src,
			sequenceContext?.durationInFrames,
			sequenceContext?.from,
		]
	);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	useEffect(() => {
		if (!props.src) {
			throw new Error('No src passed');
		}

		if (props.muted) {
			return;
		}

		registerAsset({
			type: 'video',
			src: props.src,
			id,
			sequenceFrame: frame,
			volume: evaluateVolume({
				volume: props.volume,
				frame,
			}),
			isRemote: isRemoteAsset(props.src),
		});

		return () => unregisterAsset(id);
	}, [
		props.muted,
		props.src,
		registerAsset,
		id,
		unregisterAsset,
		frame,
		props.volume,
	]);

	useEffect(() => {
		if (!videoRef.current) {
			return;
		}

		const currentTime = (() => {
			if (FEATURE_FLAG_V2_BREAKING_CHANGES) {
				// In Chrome, if 30fps, the first frame is still displayed at 0.033333
				// even though after that it increases by 0.033333333 each.
				// So frame = 0 in Remotion is like frame = 1 for the browser
				return (frame + 1) / videoConfig.fps;
			}
			return frame / (1000 / videoConfig.fps);
		})();
		const handle = delayRender();
		if (process.env.NODE_ENV === 'test') {
			continueRender(handle);
			return;
		}
		if (isApproximatelyTheSame(videoRef.current.currentTime, currentTime)) {
			if (videoRef.current.readyState >= 2) {
				continueRender(handle);
				return;
			}
			videoRef.current.addEventListener(
				'loadeddata',
				() => {
					continueRender(handle);
				},
				{once: true}
			);
			return;
		}
		videoRef.current.currentTime = currentTime;

		videoRef.current.addEventListener(
			'seeked',
			() => {
				// Improve me: This is ensures frame perfectness but slows down render.
				// Please see this issue for context: https://github.com/JonnyBurger/remotion/issues/200
				setTimeout(() => {
					continueRender(handle);
				}, 300);
			},
			{once: true}
		);
		videoRef.current.addEventListener(
			'ended',
			() => {
				continueRender(handle);
			},
			{once: true}
		);
		videoRef.current.addEventListener(
			'error',
			(err) => {
				console.error('Error occurred in video', err);
				continueRender(handle);
			},
			{once: true}
		);
	}, [frame, videoConfig.fps]);

	return <video ref={videoRef} {...props} />;
};
