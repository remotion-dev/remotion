import React, {useEffect, useMemo, useRef} from 'react';
import {continueRender, delayRender} from '../ready-manager';
import {useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {RemotionVideoProps} from './props';

export const VideoForRendering: React.FC<RemotionVideoProps> = (props) => {
	const currentFrame = useCurrentFrame();
	const videoConfig = useUnsafeVideoConfig();
	const videoRef = useRef<HTMLVideoElement>(null);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	const frameInSeconds = useMemo(() => currentFrame / videoConfig.fps, [
		currentFrame,
		videoConfig.fps,
	]);

	useEffect(() => {
		if (!videoRef.current) {
			return;
		}
		console.log('delaying');
		const handle = delayRender();
		if (videoRef.current.currentTime === frameInSeconds) {
			videoRef.current.addEventListener(
				'loadeddata',
				() => {
					continueRender(handle);
				},
				{once: true}
			);
		} else {
			videoRef.current.currentTime = frameInSeconds;
			videoRef.current.addEventListener(
				'seeked',
				() => {
					continueRender(handle);
				},
				{once: true}
			);
		}
	}, [currentFrame, frameInSeconds, videoConfig.fps]);

	return <video ref={videoRef} {...props} />;
};
