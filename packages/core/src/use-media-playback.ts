import type {RefObject} from 'react';
import {useContext, useEffect} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error';
import {
	TimelineContext,
	usePlayingState,
	useTimelinePosition,
} from './timeline-position-state';
import {useCurrentFrame} from './use-current-frame';
import {useVideoConfig} from './use-video-config';
import {getMediaTime} from './video/get-current-time';
import {warnAboutNonSeekableMedia} from './warn-about-non-seekable-media';

export const DEFAULT_ACCEPTABLE_TIMESHIFT = 0.45;

export const useMediaPlayback = ({
	mediaRef,
	src,
	mediaType,
	playbackRate: localPlaybackRate,
	onlyWarnForMediaSeekingError,
	acceptableTimeshift,
}: {
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
	onlyWarnForMediaSeekingError: boolean;
	acceptableTimeshift: number;
}) => {
	const {playbackRate: globalPlaybackRate} = useContext(TimelineContext);
	const frame = useCurrentFrame();
	const absoluteFrame = useTimelinePosition();
	const [playing] = usePlayingState();
	const {fps} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();

	const playbackRate = localPlaybackRate * globalPlaybackRate;

	useEffect(() => {
		if (!playing) {
			mediaRef.current?.pause();
		}
	}, [mediaRef, mediaType, playing]);

	useEffect(() => {
		const tagName = mediaType === 'audio' ? '<Audio>' : '<Video>';
		if (!mediaRef.current) {
			throw new Error(`No ${mediaType} ref found`);
		}

		if (!src) {
			throw new Error(
				`No 'src' attribute was passed to the ${tagName} element.`
			);
		}

		mediaRef.current.playbackRate = Math.max(0, playbackRate);

		const shouldBeTime = getMediaTime({
			fps,
			frame,
			src,
			playbackRate: localPlaybackRate,
			startFrom: -mediaStartsAt,
			mediaType,
		});

		const isTime = mediaRef.current.currentTime;
		const timeShift = Math.abs(shouldBeTime - isTime);
		if (timeShift > acceptableTimeshift && !mediaRef.current.ended) {
			// If scrubbing around, adjust timing
			// or if time shift is bigger than 0.2sec
			mediaRef.current.currentTime = shouldBeTime;
			if (!onlyWarnForMediaSeekingError) {
				warnAboutNonSeekableMedia(
					mediaRef.current,
					onlyWarnForMediaSeekingError ? 'console-warning' : 'console-error'
				);
			}
		}

		if (!playing || absoluteFrame === 0) {
			mediaRef.current.currentTime = shouldBeTime;
		}

		if (mediaRef.current.paused && !mediaRef.current.ended && playing) {
			const {current} = mediaRef;
			current.currentTime = shouldBeTime;
			playAndHandleNotAllowedError(mediaRef, mediaType);
		}
	}, [
		absoluteFrame,
		fps,
		playbackRate,
		frame,
		mediaRef,
		mediaType,
		playing,
		src,
		mediaStartsAt,
		localPlaybackRate,
		onlyWarnForMediaSeekingError,
		acceptableTimeshift,
	]);
};
