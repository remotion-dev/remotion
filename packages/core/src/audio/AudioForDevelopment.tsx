import React, {forwardRef, useImperativeHandle, useMemo} from 'react';
import {useMediaInTimeline} from '../use-media-in-timeline';
import {useMediaPlayback} from '../use-media-playback';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import {
	useMediaMutedState,
	useMediaVolumeState,
} from '../volume-position-state';
import {RemotionAudioProps} from './props';
import {useSharedAudio} from './shared-audio-tags';
import {useFrameForVolumeProp} from './use-audio-frame';

const AudioForDevelopmentForwardRefFunction: React.ForwardRefRenderFunction<
	HTMLAudioElement,
	RemotionAudioProps
> = (props, ref) => {
	const [mediaVolume] = useMediaVolumeState();
	const [mediaMuted] = useMediaMutedState();

	const volumePropFrame = useFrameForVolumeProp();

	const {volume, muted, playbackRate, ...nativeProps} = props;

	const propsToPass = useMemo((): RemotionAudioProps => {
		return {
			muted: muted || mediaMuted,
			...nativeProps,
		};
	}, [mediaMuted, muted, nativeProps]);

	const elem = useSharedAudio(propsToPass);

	const actualVolume = useMediaTagVolume(elem.el);

	useSyncVolumeWithMediaTag({
		volumePropFrame,
		actualVolume,
		volume,
		mediaVolume,
		mediaRef: elem.el,
	});

	useMediaInTimeline({
		volume,
		mediaVolume,
		mediaRef: elem.el,
		src: nativeProps.src,
		mediaType: 'audio',
	});

	useMediaPlayback({
		mediaRef: elem.el,
		src: nativeProps.src,
		mediaType: 'audio',
		playbackRate: playbackRate ?? 1,
	});

	useImperativeHandle(ref, () => {
		return elem.el.current as HTMLAudioElement;
	});

	return null;
};

export const AudioForDevelopment = forwardRef(
	AudioForDevelopmentForwardRefFunction
);
