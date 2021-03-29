import React, {useEffect, useRef} from 'react';
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

		// target middle of frame to reduce risk of rounding errors (which can cause the wrong frame to be shown)
		const msPerFrame = 1000 / videoConfig.fps;
		const msShift = msPerFrame / 2;
		const frameInSeconds = (frame * msPerFrame + msShift) / 1000;

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
