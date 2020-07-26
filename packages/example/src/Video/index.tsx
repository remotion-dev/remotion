import {
	deferRender,
	readyToRender,
	registerVideo,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React, {useCallback, useEffect, useRef, useState} from 'react';

deferRender();

export const Comp: React.FC = () => {
	const [metadataLoaded, setMetadataLoaded] = useState(false);
	const [currentFrameSet, setCurrentFrameSet] = useState(false);
	const [readyState, setReadyState] = useState(-1);
	const currentFrame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const videoRef = useRef<HTMLVideoElement>(null);

	const setFrame = useCallback(() => {
		if (!videoRef.current) {
			return;
		}
		videoRef.current.currentTime = currentFrame / videoConfig.fps;
		setInterval(() => {
			setCurrentFrameSet(true);
		}, 0);
	}, [currentFrame, videoConfig.fps]);

	const onMetadataLoad = useCallback(() => {
		setMetadataLoaded(true);
	}, []);

	useEffect(() => {
		if (metadataLoaded) {
			setFrame();
		}
	}, [metadataLoaded, currentFrameSet, setFrame]);

	useEffect(() => {
		if (currentFrameSet && readyState === 4) {
			readyToRender();
		}
	}, [currentFrameSet, readyState]);

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
			current?.removeEventListener('loadedmetadata', onMetadataLoad);
		};
	}, [currentFrame, metadataLoaded, onMetadataLoad, setFrame, videoConfig.fps]);

	const onSetReadyState = useCallback(() => {
		if (!videoRef.current) {
			throw Error('No vide ref');
		}
		setReadyState(videoRef.current.readyState);
	}, []);

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

	return (
		<div style={{flex: 1, display: 'flex'}}>
			<video
				ref={videoRef}
				style={{height: 1000, width: 1000}}
				src="video.webm"
			/>
		</div>
	);
};

registerVideo(Comp, {
	fps: 60,
	height: 1080,
	width: 1080,
	durationInFrames: 10,
});
