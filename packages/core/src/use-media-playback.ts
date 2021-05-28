import {RefObject, useEffect} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame';
import {usePlayingState} from './timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from './use-frame';
import {useVideoConfig} from './use-video-config';
import {getMediaTime} from './video/get-current-time';
import {warnAboutNonSeekableMedia} from './warn-about-non-seekable-media';

export const useMediaPlayback = ({
	mediaRef,
	src,
	mediaType,
	playbackRate,
}: {
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>;
	src: string | undefined;
	mediaType: 'audio' | 'video';
	playbackRate: number;
}) => {
	const frame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();
	const [playing] = usePlayingState();
	const {fps} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();

	useEffect(() => {
		if (playing && !mediaRef.current?.ended) {
			mediaRef.current?.play();
		} else {
			mediaRef.current?.pause();
		}
	}, [mediaRef, playing]);

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

		mediaRef.current.playbackRate = playbackRate;

		const shouldBeTime = getMediaTime({
			fps,
			frame,
			src,
			playbackRate,
			startFrom: -mediaStartsAt,
		});

		const isTime = mediaRef.current.currentTime;
		const timeShift = Math.abs(shouldBeTime - isTime);
		if (timeShift > 0.45 && !mediaRef.current.ended) {
			console.log('Time has shifted by', timeShift, 'sec. Fixing...');
			// If scrubbing around, adjust timing
			// or if time shift is bigger than 0.2sec
			mediaRef.current.currentTime = shouldBeTime;
			warnAboutNonSeekableMedia(mediaRef.current);
		}

		if (!playing || absoluteFrame === 0) {
			mediaRef.current.currentTime = shouldBeTime;
		}

		if (mediaRef.current.paused && !mediaRef.current.ended && playing) {
			mediaRef.current.currentTime = shouldBeTime;
			mediaRef.current.play();
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
	]);
};
