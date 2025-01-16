import type {LogLevel} from './log';
import {Log} from './log';
import {isIosSafari} from './video/video-fragment';

export const seek = ({
	mediaRef,
	time,
	logLevel,
	why,
}: {
	mediaRef: HTMLVideoElement | HTMLAudioElement;
	time: number;
	logLevel: LogLevel;
	why: string;
}): number => {
	// iOS seeking does not support multiple decimals
	const timeToSet = isIosSafari() ? Number(time.toFixed(1)) : time;
	Log.trace(
		logLevel,
		`[seek] from ${mediaRef.currentTime} to ${timeToSet}. Reason; ${why}`,
	);

	mediaRef.currentTime = timeToSet;
	return timeToSet;
};
