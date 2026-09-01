import {
	withLoadedWhisperPipeline,
	type OnWhisperWebGpuModelLoadProgress,
} from './load-whisper-model';
import {getModelInfo, type WhisperWebGpuModel} from './models';

export type WhisperWebGpuWord = {
	text: string;
	startInSeconds: number;
	endInSeconds: number;
};

export type WhisperWebGpuTranscription = {
	text: string;
	words: WhisperWebGpuWord[];
	model: WhisperWebGpuModel;
};

export type TranscribeOptions = {
	channelWaveform: Float32Array;
	model: WhisperWebGpuModel;
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
	language,
	chunkLengthInSeconds = 30,
	strideLengthInSeconds = 5,
	onModelLoadProgress,
}: TranscribeOptions): Promise<WhisperWebGpuTranscription> => {
	if (channelWaveform.length === 0) {
		throw new Error('The audio waveform is empty.');
	}

	if (!Number.isFinite(chunkLengthInSeconds) || chunkLengthInSeconds <= 0) {
		throw new Error(
			'chunkLengthInSeconds must be a finite number greater than 0.',
		);
	}

	if (
		!Number.isFinite(strideLengthInSeconds) ||
		strideLengthInSeconds < 0 ||
		strideLengthInSeconds * 2 >= chunkLengthInSeconds
	) {
		throw new Error(
			'strideLengthInSeconds must be a finite, non-negative number and less than half of chunkLengthInSeconds.',
		);
	}

	const {multilingual} = getModelInfo(model);
	if (multilingual && (language === undefined || language === 'auto')) {
		throw new Error(
			`The language option is required for the multilingual model "${model}" because automatic language detection is not supported.`,
		);
	}

	if (
		!multilingual &&
		language !== undefined &&
		language !== 'auto' &&
		language !== 'en' &&
		language !== 'english'
	) {
		throw new Error(
			`The English-only model "${model}" does not support the language "${language}".`,
		);
	}

	const output = await withLoadedWhisperPipeline({
		model,
		onProgress: onModelLoadProgress,
		run: async (transcriber) => {
			return (await transcriber(channelWaveform, {
				return_timestamps: 'word',
				chunk_length_s: chunkLengthInSeconds,
				stride_length_s: strideLengthInSeconds,
				...(multilingual ? {language} : {}),
			})) as TransformersJsTranscription;
		},
	});

	if (!output.chunks) {
		throw new Error(
			'The model did not return word-level timestamps. Use one of the timestamped models returned by getAvailableModels().',
		);
	}

	const audioDuration = channelWaveform.length / 16_000;
	const starts = output.chunks.map((chunk) => {
		const start = chunk.timestamp[0];
		if (start === null || !Number.isFinite(start)) {
			throw new Error(
				`The model returned an invalid timestamp for "${chunk.text}".`,
			);
		}

		return Math.max(0, Math.min(start, audioDuration));
	});
	const words = output.chunks.map((chunk, index): WhisperWebGpuWord => {
		const start = starts[index];
		const modelEnd = chunk.timestamp[1];
		const nextStart = starts[index + 1];
		const fallbackEnd =
			nextStart === undefined || nextStart < start ? audioDuration : nextStart;
		const end = Math.max(
			start,
			Math.min(
				modelEnd !== null && Number.isFinite(modelEnd) && modelEnd >= start
					? modelEnd
					: fallbackEnd,
				audioDuration,
			),
		);

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
	};
};
