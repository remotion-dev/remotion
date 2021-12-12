import React, {forwardRef, useImperativeHandle, useMemo, useState} from 'react';
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
	HTMLAudioElement | null,
	RemotionAudioProps & {
		shouldPreMountAudioTags: boolean;
	}
> = (props, ref) => {
	const [initialShouldPreMountAudioElements] = useState(
		props.shouldPreMountAudioTags
	);
	if (props.shouldPreMountAudioTags !== initialShouldPreMountAudioElements) {
		throw new Error(
			'Cannot change the behavior for pre-mounting audio tags dynamically.'
		);
	}

	const [mediaVolume] = useMediaVolumeState();
	const [mediaMuted] = useMediaMutedState();

	const volumePropFrame = useFrameForVolumeProp();

	const {volume, muted, playbackRate, shouldPreMountAudioTags, ...nativeProps} =
		props;

	const propsToPass = useMemo((): RemotionAudioProps => {
		return {
			muted: muted || mediaMuted,
			...nativeProps,
		};
	}, [mediaMuted, muted, nativeProps]);

	const audioRef = useSharedAudio(propsToPass);

	const actualVolume = useMediaTagVolume(audioRef);

	useSyncVolumeWithMediaTag({
		volumePropFrame,
		actualVolume,
		volume,
		mediaVolume,
		mediaRef: audioRef,
	});

	useMediaInTimeline({
		volume,
		mediaVolume,
		mediaRef: audioRef,
		src: nativeProps.src,
		mediaType: 'audio',
	});

	useMediaPlayback({
		mediaRef: audioRef,
		src: nativeProps.src,
		mediaType: 'audio',
		playbackRate: playbackRate ?? 1,
	});

	useImperativeHandle(
		ref,
		// @ts-expect-error
		() => {
			if (!audioRef) {
				return null;
			}

			return audioRef.current as HTMLAudioElement;
		},
		[audioRef]
	);

	if (initialShouldPreMountAudioElements) {
		return null;
	}

	return <audio ref={audioRef} {...propsToPass} />;
};

export const AudioForDevelopment = forwardRef(
	AudioForDevelopmentForwardRefFunction
);
