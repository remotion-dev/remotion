import type {AudioOrVideoSample, WriterInterface} from '@remotion/media-parser';
import type {LogLevel} from '../log';
import type {MakeTrackAudio, MakeTrackVideo} from './make-track-info';
import type {ProgressTracker} from './progress-tracker';

export type MediaFn = {
	getBlob: () => Promise<Blob>;
	remove: () => Promise<void>;
	addSample: (options: {
		chunk: AudioOrVideoSample;
		trackNumber: number;
		isVideo: boolean;
		codecPrivate: Uint8Array | null;
	}) => Promise<void>;
	addTrack: (
		track:
			| Omit<MakeTrackAudio, 'trackNumber'>
			| Omit<MakeTrackVideo, 'trackNumber'>,
	) => Promise<{trackNumber: number}>;
	addWaitForFinishPromise: (promise: () => Promise<void>) => void;
	waitForFinish: () => Promise<void>;
	updateTrackSampleRate: (options: {
		trackNumber: number;
		sampleRate: number;
	}) => void;
};

export type MediaFnGeneratorInput = {
	writer: WriterInterface;
	onBytesProgress: (totalBytes: number) => void;
	onMillisecondsProgress: (totalMilliseconds: number) => void;
	logLevel: LogLevel;
	filename: string;
	progressTracker: ProgressTracker;
};
