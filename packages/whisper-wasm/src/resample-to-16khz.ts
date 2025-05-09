import type {LogLevel} from './log';
import {Log} from './log';

// this is a requirement of whisper.cpp
export const EXPECTED_SAMPLE_RATE = 16000;

let context: AudioContext | undefined;

const getAudioContext = () => {
	if (!context) {
		context = new AudioContext({
			sampleRate: EXPECTED_SAMPLE_RATE,
		});
	}

	return context;
};

const audioDecoder = async (
	audioBuffer: AudioBuffer,
): Promise<Float32Array> => {
	const offlineContext = new OfflineAudioContext(
		audioBuffer.numberOfChannels,
		audioBuffer.length,
		audioBuffer.sampleRate,
	);

	const source = offlineContext.createBufferSource();
	source.buffer = audioBuffer;
	source.connect(offlineContext.destination);
	source.start(0);

	const renderedBuffer = await offlineContext.startRendering();
	return renderedBuffer.getChannelData(0);
};

export type ResampleTo16KhzParams = {
	file: Blob;
	onProgress?: (p: number) => void;
	logLevel?: LogLevel;
};

export const resampleTo16Khz = async ({
	file,
	onProgress,
	logLevel = 'info',
}: ResampleTo16KhzParams): Promise<Float32Array> => {
	Log.info(logLevel, `Starting resampling for file, size: ${file.size}`);
	onProgress?.(0);

	if (typeof window === 'undefined') {
		Log.error(
			logLevel,
			'Window object not found. Resampling can only be done in a browser environment.',
		);
		throw new Error(
			'Window object not found. Resampling requires a browser environment.',
		);
	}

	if (!file) {
		Log.error(logLevel, 'File is empty.');
		throw new Error('File is empty');
	}

	const innerContext = getAudioContext();
	const reader = new FileReader();

	return new Promise<Float32Array>((resolve, reject) => {
		reader.onprogress = (event) => {
			if (event.lengthComputable) {
				const percentage = (event.loaded / event.total) * 0.5; // File reading up to 50%
				onProgress?.(Math.min(0.5, percentage));
			}
		};

		reader.onload = async () => {
			try {
				Log.info(logLevel, 'File reading complete. Decoding audio data...');
				onProgress?.(0.5);
				const buffer = new Uint8Array(reader.result as ArrayBuffer);
				const audioBuffer = await innerContext.decodeAudioData(
					buffer.buffer as ArrayBuffer,
				);
				Log.info(logLevel, 'Audio decoding complete. Starting rendering...');
				onProgress?.(0.75);

				const processedAudio = await audioDecoder(audioBuffer);
				Log.info(logLevel, 'Audio resampling and processing complete.');
				onProgress?.(1);
				resolve(processedAudio);
			} catch (error) {
				Log.error(logLevel, 'Error during audio processing:', error);
				reject(error);
			}
		};

		reader.onerror = () => {
			Log.error(logLevel, 'File reading failed.');
			reject(new Error('File reading failed'));
		};

		reader.readAsArrayBuffer(file);
	});
};
