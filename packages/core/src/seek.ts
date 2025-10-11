import type {LogLevel} from './log';
import {playbackLogging} from './playback-logging';
import {isIosSafari} from './video/video-fragment';

export const seek = ({
	mediaRef,
	time,
	logLevel,
	why,
	mountTime,
}: {
	mediaRef: HTMLVideoElement | HTMLAudioElement;
	time: number;
	logLevel: LogLevel;
	why: string;
	mountTime: number;
}): number => {
	// iOS seeking does not support multiple decimals
	const timeToSet = isIosSafari() ? Number(time.toFixed(1)) : time;

	playbackLogging({
		logLevel,
		tag: 'seek',
		message: `Seeking from ${mediaRef.currentTime} to ${timeToSet}. src= ${mediaRef.src} Reason: ${why}`,
		mountTime,
	});

	mediaRef.currentTime = timeToSet;
	return timeToSet;
};
