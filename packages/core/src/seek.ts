import {useCallback, useRef} from 'react';
import type {LogLevel} from './log';
import {useLogging} from './log-level-context';
import {playbackLogging} from './playback-logging';
import {isIosSafari} from './video/video-fragment';

export type SeekOptions = {
	mediaRef: HTMLVideoElement | HTMLAudioElement;
	time: number;
	why: string;
};

export type Seek = (options: SeekOptions) => number;

const seek = ({
	mediaRef,
	time,
	logLevel,
	why,
	mountTime,
}: SeekOptions & {
	logLevel: LogLevel;
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

export const useSeek = (): Seek => {
	const logging = useLogging();
	const loggingRef = useRef(logging);
	loggingRef.current = logging;

	return useCallback(
		(options) => seek({...options, ...loggingRef.current}),
		[],
	);
};
