import type {
	MediaParserAudioSample,
	MediaParserVideoSample,
} from '@remotion/media-parser';
import {Log} from '../../log';
import type {MediaFn, MediaFnGeneratorInput} from '../media-fn';

// ID3v2 header constants
const ID3V2_HEADER = new Uint8Array([0x49, 0x44, 0x33]); // "ID3"
const ID3V2_VERSION = new Uint8Array([0x03, 0x00]); // Version 2.3.0
const ID3V2_FLAGS = new Uint8Array([0x00]); // No flags

const encodeSyncSafeInt32 = (value: number): Uint8Array => {
	return new Uint8Array([
		(value >> 21) & 0x7f,
		(value >> 14) & 0x7f,
		(value >> 7) & 0x7f,
		value & 0x7f,
	]);
};

const createId3V2Header = (dataSize: number): Uint8Array => {
	const header = new Uint8Array(10);
	header.set(ID3V2_HEADER, 0);
	header.set(ID3V2_VERSION, 3);
	header.set(ID3V2_FLAGS, 5);
	header.set(encodeSyncSafeInt32(dataSize), 6);
	return header;
};

export const createMp3 = async ({
	filename,
	logLevel,
	onBytesProgress,
	onMillisecondsProgress,
	writer,
	progressTracker,
}: MediaFnGeneratorInput): Promise<MediaFn> => {
	const w = await writer.createContent({
		filename,
		mimeType: 'audio/mpeg',
		logLevel,
	});

	// Write minimal ID3v2 header (10 bytes header + 0 bytes data)
	const id3Header = createId3V2Header(0);
	await w.write(id3Header);

	const operationProm = {current: Promise.resolve()};

	const addSample = async (
		chunk: MediaParserAudioSample | MediaParserVideoSample,
	) => {
		Log.trace(logLevel, 'Adding MP3 sample', chunk);
		// Write the raw audio data (assuming it's already MP3-encoded)
		await w.write(chunk.data);
		onMillisecondsProgress((chunk.timestamp + (chunk.duration ?? 0)) / 1000);
		onBytesProgress(w.getWrittenByteCount());
	};

	const waitForFinishPromises: (() => Promise<void>)[] = [];

	return {
		getBlob: () => {
			return w.getBlob();
		},
		remove: () => {
			return w.remove();
		},
		addSample: ({chunk, trackNumber}) => {
			if (trackNumber !== 1) {
				throw new Error('Only one track supported for MP3');
			}

			operationProm.current = operationProm.current.then(() =>
				addSample(chunk),
			);

			progressTracker.updateTrackProgress(trackNumber, chunk.timestamp);

			return operationProm.current;
		},
		updateTrackSampleRate: () => {
			// MP3 sample rate is encoded in the frame headers, so no separate update needed
		},
		addWaitForFinishPromise: (promise) => {
			waitForFinishPromises.push(promise);
		},
		async waitForFinish() {
			Log.verbose(
				logLevel,
				'All MP3 write operations queued. Waiting for finish...',
			);
			await Promise.all(waitForFinishPromises.map((p) => p()));
			await operationProm.current;
			await w.finish();
		},
		addTrack: async (track) => {
			if (track.type !== 'audio') {
				throw new Error('Only audio tracks supported for MP3');
			}

			progressTracker.registerTrack(1);

			return Promise.resolve({trackNumber: 1});
		},
	};
};
