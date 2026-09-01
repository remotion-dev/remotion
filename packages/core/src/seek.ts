import type {Logger} from './logger.js';
import {isIosSafari} from './video/video-fragment';

export const seek = ({
	mediaRef,
	time,
	logger,
	why,
}: {
	mediaRef: HTMLVideoElement | HTMLAudioElement;
	time: number;
	logger: Logger;
	why: string;
}): number => {
	// iOS seeking does not support multiple decimals
	const timeToSet = isIosSafari() ? Number(time.toFixed(1)) : time;

	logger.playback(
		'seek',
		`Seeking from ${mediaRef.currentTime} to ${timeToSet}. src= ${mediaRef.src} Reason: ${why}`,
	);

	mediaRef.currentTime = timeToSet;
	return timeToSet;
};
