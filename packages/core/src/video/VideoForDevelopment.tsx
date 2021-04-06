import React, {useRef} from 'react';
import {useAudioFrame} from '../audio/use-audio-frame';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useMediaInTimeline} from '../use-media-in-timeline';
import {useMediaPlayback} from '../use-media-playback';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {RemotionVideoProps} from './props';

export const VideoForDevelopment: React.FC<RemotionVideoProps> = (props) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const frame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();

	const audioFrame = useAudioFrame();
	const videoConfig = useUnsafeVideoConfig();

	const {volume, ...nativeProps} = props;

	const actualVolume = useMediaTagVolume(videoRef);

	useMediaInTimeline({
		videoConfig,
		mediaRef: videoRef,
		volume,
		mediaType: 'video',
		src: nativeProps.src,
	});

	useSyncVolumeWithMediaTag({
		audioFrame,
		actualVolume,
		volume,
		mediaRef: videoRef,
	});

	useMediaPlayback({
		mediaRef: videoRef,
		absoluteFrame,
		frame,
		src: nativeProps.src,
		videoConfig,
		mediaType: 'video',
	});

	return <video ref={videoRef} {...nativeProps} />;
};
