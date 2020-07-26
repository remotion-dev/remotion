import {readyToRender, useCurrentFrame, useVideoConfig} from '@remotion/core';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AllowedVideoProps} from './props';

export const VideoForRendering: React.FC<AllowedVideoProps> = (props) => {
	const [metadataLoaded, setMetadataLoaded] = useState(false);
	const [currentFrameSet, setCurrentFrameSet] = useState(false);
	const [bufferedRanges, setBufferedRanges] = useState<null | TimeRanges>(null);
	const [timeChanges, setTimeChanged] = useState(false);
	const [readyState, setReadyState] = useState(-1);
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
		const isBuffered =
			bufferedRanges &&
			new Array(bufferedRanges.length).fill(true).some((_, i) => {
				const start = bufferedRanges.start(i);
				const end = bufferedRanges.end(i);
				return start <= frameInSeconds && end >= frameInSeconds;
			});
		if (currentFrameSet && readyState === 4 && isBuffered && timeChanges) {
			readyToRender();
		}
	}, [
		bufferedRanges,
		currentFrameSet,
		frameInSeconds,
		readyState,
		timeChanges,
	]);

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
		setBufferedRanges(videoRef.current.buffered);
	}, [videoRef]);

	const onTimeChanged = useCallback(() => {
		setTimeChanged(true);
	}, []);

	useEffect(() => {
		const {current} = videoRef;
		current?.addEventListener('timeupdate', onTimeChanged);
		return (): void => {
			current?.removeEventListener('timeupdate', onTimeChanged);
		};
	}, [onTimeChanged]);

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
