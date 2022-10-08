import type {ForwardRefExoticComponent, RefAttributes} from 'react';
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import {useFrameForVolumeProp} from '../audio/use-audio-frame';
import {continueRender, delayRender} from '../delay-render';
import {Loop} from '../loop';
import {usePreload} from '../prefetch';
import {useMediaInTimeline} from '../use-media-in-timeline';
import {useMediaPlayback} from '../use-media-playback';
import {useMediaTagVolume} from '../use-media-tag-volume';
import {useSyncVolumeWithMediaTag} from '../use-sync-volume-with-media-tag';
import {useVideoConfig} from '../use-video-config';
import {
	useMediaMutedState,
	useMediaVolumeState,
} from '../volume-position-state';
import type {RemotionVideoProps} from './props';

type VideoForDevelopmentProps = RemotionVideoProps & {
	onlyWarnForMediaSeekingError: boolean;
};

const VideoForDevelopmentRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLVideoElement,
	VideoForDevelopmentProps
> = (props, ref) => {
	const videoRef = useRef<HTMLVideoElement>(null);

	const [checkLoop] = useState(() => delayRender());
	const videoDuration = useRef<number | null>(null);

	const volumePropFrame = useFrameForVolumeProp();
	const {fps} = useVideoConfig();

	const {
		volume,
		muted,
		playbackRate,
		onlyWarnForMediaSeekingError,
		src,
		...nativeProps
	} = props;

	const actualVolume = useMediaTagVolume(videoRef);

	const [mediaVolume] = useMediaVolumeState();
	const [mediaMuted] = useMediaMutedState();

	useMediaInTimeline({
		mediaRef: videoRef,
		volume,
		mediaVolume,
		mediaType: 'video',
		src,
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
		src,
		mediaType: 'video',
		playbackRate: props.playbackRate ?? 1,
		onlyWarnForMediaSeekingError,
	});

	const actualSrc = usePreload(src as string);

	useImperativeHandle(
		ref,
		() => {
			return videoRef.current as HTMLVideoElement;
		},
		[]
	);

	useEffect(() => {
		const {current} = videoRef;
		if (!current) {
			return;
		}

		current.onloadedmetadata = () => {
			videoDuration.current = current.duration;
			continueRender(checkLoop);
		};

		const errorHandler = () => {
			if (current?.error) {
				console.error('Error occurred in video', current?.error);
				throw new Error(
					`The browser threw an error while playing the video ${src}: Code ${current.error.code} - ${current?.error?.message}. See https://remotion.dev/docs/media-playback-error for help`
				);
			} else {
				throw new Error('The browser threw an error');
			}
		};

		current.addEventListener('error', errorHandler, {once: true});
		return () => {
			current.removeEventListener('error', errorHandler);
		};
	}, [src, checkLoop]);

	if (props.loop && videoDuration.current) {
		return (
			<Loop durationInFrames={Math.round(videoDuration.current * fps)}>
				<VideoForDevelopment
					{...props}
					ref={videoRef}
					src={actualSrc}
					loop={false}
				/>
			</Loop>
		);
	}

	return (
		<video
      ref={videoRef}
			muted={muted || mediaMuted}
			playsInline
			src={actualSrc}
			{...nativeProps}
		/>
	);
};

// Copy types from forwardRef but not necessary to remove ref
export const VideoForDevelopment = forwardRef(
	VideoForDevelopmentRefForwardingFunction
) as ForwardRefExoticComponent<
	VideoForDevelopmentProps & RefAttributes<HTMLVideoElement>
>;
