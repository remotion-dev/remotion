import {RefObject, useEffect} from 'react';
import {useMediaStartsAt} from './audio/use-audio-frame';
import {usePlayingState} from './timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from './use-frame';
import {useMediaHasMetadata} from './use-media-metadata';
import {useVideoConfig} from './use-video-config';
import {getMediaTime} from './video/get-current-time';
import {warnAboutNonSeekableMedia} from './warn-about-non-seekable-media';

const playAndHandleNotAllowedError = (
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>,
	mediaType: 'audio' | 'video'
) => {
	const {current} = mediaRef;
	const prom = current?.play();
	if (prom?.catch) {
		prom?.catch((err) => {
			if (!current) {
				return;
			}

			console.log(`Could not play ${mediaType} due to following error: `, err);
			if (!current.muted) {
				console.log(`The video will be muted and we'll retry playing it.`, err);
				current.muted = true;
				current.play();
			}
		});
	}
};

export const useMediaPlayback = ({
	mediaRef,
	mediaType,
	playbackRate,
}: {
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>;
	mediaType: 'audio' | 'video';
	playbackRate: number;
}) => {
	const {currentSrc} = mediaRef.current || {};
	const frame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();
	const [playing] = usePlayingState();
	const {fps} = useVideoConfig();
	const mediaStartsAt = useMediaStartsAt();
	const hasMetadata = useMediaHasMetadata(mediaRef);

	useEffect(() => {
		if (playing && !mediaRef.current?.ended) {
			playAndHandleNotAllowedError(mediaRef, mediaType);
		} else {
			mediaRef.current?.pause();
		}
	}, [mediaRef, mediaType, playing]);

	useEffect(() => {
		const tagName = mediaType === 'audio' ? '<Audio>' : '<Video>';

		if (!mediaRef.current) {
			throw new Error(`No ${mediaType} ref found`);
		}

		if (!hasMetadata) {
			return;
		}

		if (!currentSrc) {
			throw new Error(
				`No src found. Please provide a src prop or a <source> child to the ${tagName} element.`
			);
		}

		mediaRef.current.playbackRate = playbackRate;

		const shouldBeTime = getMediaTime({
			fps,
			frame,
			playbackRate,
			src: currentSrc,
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
		hasMetadata,
		currentSrc,
		mediaStartsAt,
	]);
};
