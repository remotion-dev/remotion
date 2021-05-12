import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {useFrameForVolumeProp} from '../audio/use-audio-frame';
import {useMediaInTimeline} from '../use-media-in-timeline';
import {useMediaPlayback} from '../use-media-playback';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import {useMediaVolumeState} from '../volume-position-state';
import {RemotionVideoProps} from './props';

const VideoForDevelopmentRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	RemotionVideoProps
> = (props, ref) => {
	const videoRef = useRef<HTMLVideoElement>(null);

	const volumePropFrame = useFrameForVolumeProp();

	const {volume, ...nativeProps} = props;

	const actualVolume = useMediaTagVolume(videoRef);

	const [mediaVolume] = useMediaVolumeState();

	useMediaInTimeline({
		mediaRef: videoRef,
		volume,
		mediaVolume,
		mediaType: 'video',
		src: nativeProps.src,
	});

	useSyncVolumeWithMediaTag({
		volumePropFrame,
		actualVolume,
		volume,
		mediaVolume,
		mediaRef: videoRef,
	});

	useMediaPlayback({
		mediaRef: videoRef,
		src: nativeProps.src,
		mediaType: 'video',
		playbackRate: props.playbackRate || 1,
	});

	useImperativeHandle(ref, () => {
		return videoRef.current as HTMLVideoElement;
	});

	return <video ref={videoRef} playsInline {...nativeProps} />;
};

export const VideoForDevelopment = forwardRef(
	VideoForDevelopmentRefForwardingFunction
);
