import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {continueRender, delayRender} from '../ready-manager';
import {useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {RemotionVideoProps} from './props';

export const VideoForRendering: React.FC<RemotionVideoProps> = (props) => {
	const [metadataLoaded, setMetadataLoaded] = useState(false);
	const [currentFrameSet, setCurrentFrameSet] = useState(false);

	const [handle] = useState(() => {
		return delayRender();
	});

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

	const setFrame = useCallback(() => {
		if (!videoRef.current) {
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
		setInterval(() => {
			setCurrentFrameSet(true);
		}, 0);
	}, [frameInSeconds, handle]);

	const onMetadataLoad = useCallback(() => {
		setMetadataLoaded(true);
	}, []);

	useEffect(() => {
		if (metadataLoaded) {
			setFrame();
		}
	}, [metadataLoaded, currentFrameSet, setFrame]);

	useEffect(() => {
		if (!videoRef.current) {
			return;
		}
		if (metadataLoaded) {
			setFrame();
			return;
		}
		const {current} = videoRef;
		current.addEventListener('loadedmetadata', onMetadataLoad);

		return (): void => {
			current.removeEventListener('loadedmetadata', onMetadataLoad);
		};
	}, [currentFrame, metadataLoaded, onMetadataLoad, setFrame, videoConfig.fps]);

	const onSetReadyState = useCallback(() => {
		if (!videoRef.current) {
			throw Error('No video ref');
		}
		if (videoRef.current.readyState === 4) {
			setFrame();
		}
	}, [setFrame]);

	useEffect(() => {
		if (!videoRef.current) {
			return;
		}
		const {current} = videoRef;
		current.addEventListener('loadeddata', onSetReadyState);
		return (): void => {
			current.removeEventListener('loadeddata', onSetReadyState);
		};
	});
	return <video ref={videoRef} {...props} />;
};
