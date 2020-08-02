import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {readyToRender} from '../defer-ready';
import {useCurrentFrame} from '../use-frame';
import {useVideoConfig} from '../use-video-config';
import {AllowedVideoProps} from './props';

export const VideoForRendering: React.FC<AllowedVideoProps> = (props) => {
	const [metadataLoaded, setMetadataLoaded] = useState(false);
	const [currentFrameSet, setCurrentFrameSet] = useState(false);
	const currentFrame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const videoRef = useRef<HTMLVideoElement>(null);

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
				readyToRender();
			},
			{once: true}
		);
		setInterval(() => {
			setCurrentFrameSet(true);
		}, 0);
	}, [frameInSeconds]);

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
			throw Error('No vide ref');
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
