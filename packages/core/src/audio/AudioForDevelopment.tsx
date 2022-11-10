import type {ForwardRefExoticComponent, RefAttributes} from 'react';
import React, {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {usePreload} from '../prefetch';
import {random} from '../random';
import {SequenceContext} from '../Sequence';
import {useMediaInTimeline} from '../use-media-in-timeline';
import {
	DEFAULT_ACCEPTABLE_TIMESHIFT,
	useMediaPlayback,
} from '../use-media-playback';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import {
	useMediaMutedState,
	useMediaVolumeState,
} from '../volume-position-state';
import type {RemotionAudioProps} from './props';
import {useSharedAudio} from './shared-audio-tags';
import {useFrameForVolumeProp} from './use-audio-frame';

type AudioForDevelopmentProps = RemotionAudioProps & {
	shouldPreMountAudioTags: boolean;
	onDuration: (src: string, durationInSeconds: number) => void;
};

const AudioForDevelopmentForwardRefFunction: React.ForwardRefRenderFunction<
	HTMLAudioElement,
	AudioForDevelopmentProps
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

	const {
		volume,
		muted,
		playbackRate,
		shouldPreMountAudioTags,
		src,
		onDuration,
		acceptableTimeShiftInSeconds,
		...nativeProps
	} = props;

	if (!src) {
		throw new TypeError("No 'src' was passed to <Audio>.");
	}

	const preloadedSrc = usePreload(src);

	const propsToPass = useMemo((): RemotionAudioProps => {
		return {
			muted: muted || mediaMuted,
			src: preloadedSrc,
			...nativeProps,
		};
	}, [mediaMuted, muted, nativeProps, preloadedSrc]);

	const sequenceContext = useContext(SequenceContext);

	// Generate a string that's as unique as possible for this asset
	// but at the same time deterministic. We use it to combat strict mode issues.
	const id = useMemo(
		() =>
			`audio-${random(src ?? '')}-${sequenceContext?.relativeFrom}-${
				sequenceContext?.cumulatedFrom
			}-${sequenceContext?.durationInFrames}-muted:${props.muted}`,
		[props.muted, src, sequenceContext]
	);

	const audioRef = useSharedAudio(propsToPass, id).el;

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
		src,
		mediaType: 'audio',
	});

	useMediaPlayback({
		mediaRef: audioRef,
		src,
		mediaType: 'audio',
		playbackRate: playbackRate ?? 1,
		onlyWarnForMediaSeekingError: false,
		acceptableTimeshift:
			acceptableTimeShiftInSeconds ?? DEFAULT_ACCEPTABLE_TIMESHIFT,
	});

	useImperativeHandle(
		ref,
		() => {
			return audioRef.current as HTMLAudioElement;
		},
		[audioRef]
	);

	const currentOnDurationCallback =
		useRef<AudioForDevelopmentProps['onDuration']>();
	currentOnDurationCallback.current = onDuration;

	useEffect(() => {
		const {current} = audioRef;
		if (!current) {
			return;
		}

		if (current.duration) {
			currentOnDurationCallback.current?.(src, current.duration);
			return;
		}

		const onLoadedMetadata = () => {
			currentOnDurationCallback.current?.(src, current.duration);
		};

		current.addEventListener('loadedmetadata', onLoadedMetadata);
		return () => {
			current.removeEventListener('loadedmetadata', onLoadedMetadata);
		};
	}, [audioRef, src]);

	if (initialShouldPreMountAudioElements) {
		return null;
	}

	return <audio ref={audioRef} {...propsToPass} />;
};

export const AudioForDevelopment = forwardRef(
	AudioForDevelopmentForwardRefFunction
) as ForwardRefExoticComponent<
	AudioForDevelopmentProps & RefAttributes<HTMLAudioElement>
>;
