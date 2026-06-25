import {Internals, type LogLevel} from 'remotion';
import {resetExtractAudioQueue} from './audio-extraction/extract-audio';
import {audioManager, keyframeManager} from './caches';
import {resetExtractFrameQueue} from './video-extraction/extract-frame';

export const resetMediaExtractionState = ({
	logLevel,
	reason,
}: {
	logLevel: LogLevel;
	reason: string;
}) => {
	Internals.Log.warn(
		{logLevel, tag: '@remotion/media'},
		`Resetting media extraction queues because ${reason}`,
	);

	resetExtractFrameQueue();
	resetExtractAudioQueue();
	keyframeManager.resetQueue();
	audioManager.resetQueue();
	keyframeManager.clearAll(logLevel);
	audioManager.clearAll();
};
