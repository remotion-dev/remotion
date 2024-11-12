import type {AudioOrVideoSample} from '../webcodec-sample-types';
import type {WriterInterface} from '../writers/writer';
import type {MakeTrackAudio, MakeTrackVideo} from './matroska-trackentry';

export type MediaFn = {
	save: () => Promise<Blob>;
	remove: () => Promise<void>;
	addSample: (
		chunk: AudioOrVideoSample,
		trackNumber: number,
		isVideo: boolean,
	) => Promise<void>;
	updateDuration: (duration: number) => Promise<void>;
	addTrack: (
		track:
			| Omit<MakeTrackAudio, 'trackNumber'>
			| Omit<MakeTrackVideo, 'trackNumber'>,
	) => Promise<{trackNumber: number}>;
	addWaitForFinishPromise: (promise: () => Promise<void>) => void;
	waitForFinish: () => Promise<void>;
};

export type MediaFnGeneratorInput = {
	writer: WriterInterface;
	onBytesProgress: (totalBytes: number) => void;
	onMillisecondsProgress: (totalMilliseconds: number) => void;
};
