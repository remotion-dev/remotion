import type {
	MediaParserAudioSample,
	MediaParserInternalTypes,
	MediaParserLogLevel,
	MediaParserVideoSample,
} from '@remotion/media-parser';
import type {ConvertMediaContainer} from '../get-available-containers';
import type {MakeTrackAudio, MakeTrackVideo} from './make-track-info';
import type {ProgressTracker} from './progress-tracker';

export type MediaFn = {
	getBlob: () => Promise<Blob>;
	remove: () => Promise<void>;
	addSample: (options: {
		chunk: MediaParserAudioSample | MediaParserVideoSample;
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
	writer: MediaParserInternalTypes['WriterInterface'];
	onBytesProgress: (totalBytes: number) => void;
	onMillisecondsProgress: (totalMilliseconds: number) => void;
	logLevel: MediaParserLogLevel;
	filename: string;
	progressTracker: ProgressTracker;
	expectedDurationInSeconds: number | null;
	expectedFrameRate: number | null;
	container: ConvertMediaContainer;
};
