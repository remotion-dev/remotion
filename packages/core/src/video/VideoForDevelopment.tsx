import React, {useRef} from 'react';
import {useAudioFrame} from '../audio/use-audio-frame';
import {useMediaInTimeline} from '../use-media-in-timeline';
import {useMediaPlayback} from '../use-media-playback';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import {RemotionVideoProps} from './props';

export const VideoForDevelopment: React.FC<RemotionVideoProps> = (props) => {
	const videoRef = useRef<HTMLVideoElement>(null);

	const audioFrame = useAudioFrame();

	const {volume, ...nativeProps} = props;

	const actualVolume = useMediaTagVolume(videoRef);

	useMediaInTimeline({
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
		src: nativeProps.src,
		mediaType: 'video',
	});

	return <video ref={videoRef} {...nativeProps} />;
};
