import type {AudioOrVideoSample} from '@remotion/media-parser';
import {Log} from '../../log';
import type {MediaFn, MediaFnGeneratorInput} from '../media-fn';

const numberTo32BiIntLittleEndian = (num: number) => {
	return new Uint8Array([
		num & 0xff,
		(num >> 8) & 0xff,
		(num >> 16) & 0xff,
		(num >> 24) & 0xff,
	]);
};

const numberTo16BitLittleEndian = (num: number) => {
	return new Uint8Array([num & 0xff, (num >> 8) & 0xff]);
};

const BIT_DEPTH = 16;
const BYTES_PER_SAMPLE = BIT_DEPTH / 8;

export const createWav = async ({
	filename,
	logLevel,
	onBytesProgress,
	onMillisecondsProgress,
	writer,
	progressTracker,
}: MediaFnGeneratorInput): Promise<MediaFn> => {
	const w = await writer.createContent({
		filename,
		mimeType: 'audio/wav',
		logLevel,
	});

	await w.write(new Uint8Array([0x52, 0x49, 0x46, 0x46])); // "RIFF"
	const sizePosition = w.getWrittenByteCount();
	await w.write(new Uint8Array([0x00, 0x00, 0x00, 0x00])); // Remaining size
	await w.write(new Uint8Array([0x57, 0x41, 0x56, 0x45])); // "WAVE"
	await w.write(new Uint8Array([0x66, 0x6d, 0x74, 0x20])); // "fmt "
	await w.write(new Uint8Array([0x10, 0x00, 0x00, 0x00])); // fmt chunk size = 16
	await w.write(new Uint8Array([0x01, 0x00])); // Audio format (PCM) = 1, set 3 if float32 would be true
	const channelNumPosition = w.getWrittenByteCount();
	await w.write(new Uint8Array([0x01, 0x00])); // Number of channels = 1
	const sampleRatePosition = w.getWrittenByteCount();
	await w.write(new Uint8Array([0x0, 0x0, 0x00, 0x00])); // Sample rate
	const byteRatePosition = w.getWrittenByteCount();
	await w.write(new Uint8Array([0x0, 0x0, 0x00, 0x00])); // Byte rate
	const blockAlignPosition = w.getWrittenByteCount();
	await w.write(new Uint8Array([0x00, 0x00])); // Block align
	await w.write(numberTo16BitLittleEndian(BIT_DEPTH)); // Bits per sample
	await w.write(new Uint8Array([0x64, 0x61, 0x74, 0x61])); // "data"
	const dataSizePosition = w.getWrittenByteCount();
	await w.write(new Uint8Array([0x00, 0x00, 0x00, 0x00])); // Remaining size

	const operationProm = {current: Promise.resolve()};

	const updateSize = async () => {
		const size = w.getWrittenByteCount() - sizePosition - 4;
		await w.updateDataAt(sizePosition, numberTo32BiIntLittleEndian(size));

		const dataSize = w.getWrittenByteCount() - dataSizePosition - 4;
		await w.updateDataAt(
			dataSizePosition,
			numberTo32BiIntLittleEndian(dataSize),
		);
	};

	const updateChannelNum = async (numberOfChannels: number) => {
		await w.updateDataAt(
			channelNumPosition,
			new Uint8Array([numberOfChannels, 0x00]),
		);
	};

	const updateSampleRate = async (sampleRate: number) => {
		await w.updateDataAt(
			sampleRatePosition,
			numberTo32BiIntLittleEndian(sampleRate),
		);
	};

	const updateByteRate = async ({
		sampleRate,
		numberOfChannels,
	}: {
		sampleRate: number;
		numberOfChannels: number;
	}) => {
		await w.updateDataAt(
			byteRatePosition,
			numberTo32BiIntLittleEndian(
				sampleRate * numberOfChannels + BYTES_PER_SAMPLE,
			),
		);
	};

	const updateBlockAlign = async (numberOfChannels: number) => {
		await w.updateDataAt(
			blockAlignPosition,
			new Uint8Array(
				numberTo16BitLittleEndian(numberOfChannels * BYTES_PER_SAMPLE),
			),
		);
	};

	const addSample = async (chunk: AudioOrVideoSample) => {
		Log.trace(logLevel, 'Adding sample', chunk);
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
				throw new Error('Only one track supported for WAV');
			}

			operationProm.current = operationProm.current.then(() =>
				addSample(chunk),
			);

			progressTracker.updateTrackProgress(trackNumber, chunk.timestamp);

			return operationProm.current;
		},
		updateTrackSampleRate: () => {
			throw new Error(
				'updateTrackSampleRate() not implemented for WAV encoder',
			);
		},
		addWaitForFinishPromise: (promise) => {
			waitForFinishPromises.push(promise);
		},
		async waitForFinish() {
			Log.verbose(
				logLevel,
				'All write operations queued. Waiting for finish...',
			);
			await Promise.all(waitForFinishPromises.map((p) => p()));
			await operationProm.current;
			await updateSize();
			await w.finish();
		},
		addTrack: async (track) => {
			if (track.type !== 'audio') {
				throw new Error('Only audio tracks supported for WAV');
			}

			await updateChannelNum(track.numberOfChannels);
			await updateSampleRate(track.sampleRate);
			await updateByteRate({
				sampleRate: track.sampleRate,
				numberOfChannels: track.numberOfChannels,
			});
			await updateBlockAlign(track.numberOfChannels);

			progressTracker.registerTrack(1);

			return Promise.resolve({trackNumber: 1});
		},
	};
};
