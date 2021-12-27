import {RefObject, useContext, useEffect} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame';
import {playAndHandleNotAllowedError} from './play-and-handle-not-allowed-error';
import {TimelineContext, usePlayingState} from './timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from './use-frame';
import {useVideoConfig} from './use-video-config';
import {getMediaTime} from './video/get-current-time';
import {warnAboutNonSeekableMedia} from './warn-about-non-seekable-media';

export const useMediaPlayback = ({
	mediaRef,
	src,
	mediaType,
	playbackRate: localPlaybackRate,
}: {
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
}) => {
	const {playbackRate: globalPlaybackRate} = useContext(TimelineContext);
	const frame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();
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
		});

		const isTime = mediaRef.current.currentTime;
		const timeShift = Math.abs(shouldBeTime - isTime);
		if (timeShift > 0.45 && !mediaRef.current.ended) {
			console.log(
				'Time has shifted by',
				timeShift,
				'sec. Fixing...',
				`(isTime=${isTime},shouldBeTime=${shouldBeTime})`
			);
			// If scrubbing around, adjust timing
			// or if time shift is bigger than 0.2sec
			mediaRef.current.currentTime = shouldBeTime;
			warnAboutNonSeekableMedia(mediaRef.current);
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
	]);
};
