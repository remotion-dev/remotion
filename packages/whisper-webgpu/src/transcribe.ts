import type {
	ResolvedWhisperWebGpuBackend,
	WhisperWebGpuBackend,
} from './backend';
import {
	getLoadedWhisperPipeline,
	type OnWhisperWebGpuModelLoadProgress,
} from './load-whisper-model';
import type {WhisperWebGpuModel} from './models';

export type WhisperWebGpuWord = {
	text: string;
	startInSeconds: number;
	endInSeconds: number;
};

export type WhisperWebGpuTranscription = {
	text: string;
	words: WhisperWebGpuWord[];
	model: WhisperWebGpuModel;
	backend: ResolvedWhisperWebGpuBackend;
};

export type TranscribeOptions = {
	channelWaveform: Float32Array;
	model: WhisperWebGpuModel;
	backend?: WhisperWebGpuBackend;
	language?: string;
	chunkLengthInSeconds?: number;
	strideLengthInSeconds?: number;
	onModelLoadProgress?: OnWhisperWebGpuModelLoadProgress;
};

type TransformersJsWord = {
	text: string;
	timestamp: [number | null, number | null];
};

type TransformersJsTranscription = {
	text: string;
	chunks?: TransformersJsWord[];
};

export const transcribe = async ({
	channelWaveform,
	model,
	backend = 'auto',
	language = 'auto',
	chunkLengthInSeconds = 30,
	strideLengthInSeconds = 5,
	onModelLoadProgress,
}: TranscribeOptions): Promise<WhisperWebGpuTranscription> => {
	if (channelWaveform.length === 0) {
		throw new Error('The audio waveform is empty.');
	}

	if (chunkLengthInSeconds <= 0) {
		throw new Error('chunkLengthInSeconds must be greater than 0.');
	}

	if (
		strideLengthInSeconds < 0 ||
		strideLengthInSeconds * 2 >= chunkLengthInSeconds
	) {
		throw new Error(
			'strideLengthInSeconds must be non-negative and less than half of chunkLengthInSeconds.',
		);
	}

	const {pipeline: transcriber, backend: resolvedBackend} =
		await getLoadedWhisperPipeline({
			model,
			backend,
			onProgress: onModelLoadProgress,
		});

	const output = (await transcriber(channelWaveform, {
		return_timestamps: 'word',
		chunk_length_s: chunkLengthInSeconds,
		stride_length_s: strideLengthInSeconds,
		...(language === 'auto' ? {} : {language}),
	})) as TransformersJsTranscription;

	if (!output.chunks) {
		throw new Error(
			'The model did not return word-level timestamps. Use one of the timestamped models returned by getAvailableModels().',
		);
	}

	const audioDuration = channelWaveform.length / 16_000;
	const words = output.chunks.map((chunk, index): WhisperWebGpuWord => {
		const start = chunk.timestamp[0];
		const end = Math.min(chunk.timestamp[1] ?? audioDuration, audioDuration);
		if (start === null || !Number.isFinite(start) || !Number.isFinite(end)) {
			throw new Error(
				`The model returned an invalid timestamp for "${chunk.text}".`,
			);
		}

		if (end < start) {
			throw new Error(
				`The model returned a backwards timestamp for "${chunk.text}".`,
			);
		}

		return {
			text: index === 0 ? chunk.text.trimStart() : chunk.text,
			startInSeconds: start,
			endInSeconds: end,
		};
	});

	return {
		text: output.text.trimStart(),
		words,
		model,
		backend: resolvedBackend,
	};
};
