import React, {useEffect, useRef} from 'react';
import {FEATURE_FLAG_V2_BREAKING_CHANGES} from '../feature-flags';
import {continueRender, delayRender} from '../ready-manager';
import {useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {RemotionVideoProps} from './props';

export const VideoForRendering: React.FC<RemotionVideoProps> = ({
	onError,
	...props
}) => {
	const frame = useCurrentFrame();
	const videoConfig = useUnsafeVideoConfig();
	const videoRef = useRef<HTMLVideoElement>(null);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	useEffect(() => {
		if (!videoRef.current) {
			return;
		}
		const frameInSeconds = FEATURE_FLAG_V2_BREAKING_CHANGES
			? (frame + 1) / videoConfig.fps
			: frame / videoConfig.fps;
		const handle = delayRender();
		if (videoRef.current.currentTime === frameInSeconds) {
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
		videoRef.current.currentTime = frameInSeconds;
		videoRef.current.addEventListener(
			'seeked',
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
