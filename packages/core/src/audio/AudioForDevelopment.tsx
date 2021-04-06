import React, {useRef} from 'react';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useMediaInTimeline} from '../use-media-in-timeline';
import {useMediaPlayback} from '../use-media-playback';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {RemotionAudioProps} from './props';
import {useAudioFrame} from './use-audio-frame';

export const AudioForDevelopment: React.FC<RemotionAudioProps> = (props) => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const frame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();

	const audioFrame = useAudioFrame();
	const videoConfig = useUnsafeVideoConfig();

	const {volume, ...nativeProps} = props;

	const actualVolume = useMediaTagVolume(audioRef);

	useSyncVolumeWithMediaTag({
		audioFrame,
		actualVolume,
		volume,
		mediaRef: audioRef,
	});

	useMediaInTimeline({
		videoConfig,
		volume,
		mediaRef: audioRef,
		src: nativeProps.src,
		mediaType: 'audio',
	});

	useMediaPlayback({
		mediaRef: audioRef,
		absoluteFrame,
		frame,
		videoConfig,
		src: nativeProps.src,
		mediaType: 'audio',
	});

	return <audio ref={audioRef} {...nativeProps} />;
};
