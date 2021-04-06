import {RefObject} from 'react';
import {VideoConfig} from './video-config';
import {getCurrentTime} from './video/get-current-time';

export const useMediaPlayback = ({
	mediaRef,
	src,
	videoConfig,
	frame,
	playing,
	absoluteFrame,
	mediaType,
}: {
	mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>;
	src: string | undefined;
	videoConfig: VideoConfig | null;
	frame: number;
	playing: boolean;
	absoluteFrame: number;
	mediaType: 'audio' | 'video';
}) => {
	const tagName = mediaType === 'audio' ? '<Audio>' : '<Video>';
	if (!mediaRef.current) {
		throw new Error(`No ${mediaType} ref found`);
	}
	if (!videoConfig) {
		throw new Error(
			`No video config found. ${tagName} must be placed inside a composition.`
		);
	}
	if (!src) {
		throw new Error(`No 'src' attribute was passed to the ${tagName} element.`);
	}
	const shouldBeTime = getCurrentTime({
		fps: videoConfig.fps,
		frame,
		src,
	});

	const isTime = mediaRef.current.currentTime;
	const timeShift = Math.abs(shouldBeTime - isTime);
	if (timeShift > 0.2 && !mediaRef.current.ended) {
		console.log('Time has shifted by', timeShift, 'sec. Fixing...');
		// If scrubbing around, adjust timing
		// or if time shift is bigger than 0.2sec
		mediaRef.current.currentTime = shouldBeTime;
	}

	if (!playing || absoluteFrame === 0) {
		mediaRef.current.currentTime = shouldBeTime;
	}
	if (mediaRef.current.paused && !mediaRef.current.ended && playing) {
		mediaRef.current.currentTime = shouldBeTime;
		mediaRef.current.play();
	}
};
