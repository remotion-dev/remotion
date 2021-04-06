import React, {useEffect, useRef} from 'react';
import {usePlayingState} from '../timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useMediaPlayback} from '../use-media-playback';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {RemotionVideoProps} from './props';

export const VideoForDevelopment: React.FC<RemotionVideoProps> = (props) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const frame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();

	const videoConfig = useUnsafeVideoConfig();
	const [playing] = usePlayingState();

	const {volume, ...nativeProps} = props;

	// TODO: Register as an asset
	useEffect(() => {
		if (playing && !videoRef.current?.ended) {
			videoRef.current?.play();
		} else {
			videoRef.current?.pause();
		}
	}, [playing]);

	const actualVolume = useMediaTagVolume(videoRef);

	useSyncVolumeWithMediaTag({
		// TODO Switch to audioFrame
		audioFrame: frame,
		actualVolume,
		volume,
		mediaRef: videoRef,
	});

	useMediaPlayback({
		mediaRef: videoRef,
		absoluteFrame,
		frame,
		playing,
		src: nativeProps.src,
		videoConfig,
	});

	return <video ref={videoRef} {...nativeProps} />;
};
