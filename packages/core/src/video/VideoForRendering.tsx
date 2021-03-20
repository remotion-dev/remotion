import React, {useContext, useEffect, useRef, useState} from 'react';
import {CompositionManager} from '../CompositionManager';
import {FEATURE_FLAG_V2_BREAKING_CHANGES} from '../feature-flags';
import {continueRender, delayRender} from '../ready-manager';
import {useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {RemotionVideoProps} from './props';

const FLOATING_POINT_ERROR_THRESHOLD = 0.00001;

const isTheSame = (num1: number, num2: number) => {
	return Math.abs(num1 - num2) < FLOATING_POINT_ERROR_THRESHOLD;
};
export const VideoForRendering: React.FC<RemotionVideoProps> = ({
	onError,
	...props
}) => {
	const frame = useCurrentFrame();
	const videoConfig = useUnsafeVideoConfig();
	const videoRef = useRef<HTMLVideoElement>(null);
	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	const [id] = useState(() => String(Math.random()));

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
		});

		return () => unregisterAsset(id);
	}, [props.muted, props.src, registerAsset, id, unregisterAsset, frame]);

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
		if (isTheSame(videoRef.current.currentTime, currentTime)) {
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
