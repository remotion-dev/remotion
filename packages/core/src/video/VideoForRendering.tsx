import React, {useContext, useEffect, useRef, useState} from 'react';
import {CompositionManager} from '../CompositionManager';
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
	const {registerAsset, unregisterAsset} = useContext(CompositionManager);

	const [id] = useState(() => String(Math.random()));

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	useEffect(() => {
		if (!props.src) {
			throw new Error('No src passed');
		}

		registerAsset({
			type: 'video',
			src: props.src,
			id,
			sequenceFrame: frame,
		});
		return () => unregisterAsset(id);
	}, [props.src, registerAsset, id, unregisterAsset, frame]);

	useEffect(() => {
		if (!videoRef.current) {
			return;
		}
		const frameInSeconds = frame / videoConfig.fps;
		const handle = delayRender();
		if (videoRef.current.currentTime === frameInSeconds) {
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
