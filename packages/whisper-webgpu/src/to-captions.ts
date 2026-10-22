import type {Caption} from '@remotion/captions';
import type {WhisperWebGpuTranscription, WhisperWebGpuWord} from './transcribe';

export type ToCaptionsOptions = {
	whisperWebGpuOutput: WhisperWebGpuTranscription | WhisperWebGpuWord[];
};

export type ToCaptionsResult = {
	captions: Caption[];
};

export const toCaptions = ({
	whisperWebGpuOutput,
}: ToCaptionsOptions): ToCaptionsResult => {
	const words = Array.isArray(whisperWebGpuOutput)
		? whisperWebGpuOutput
		: whisperWebGpuOutput.words;

	return {
		captions: words.map((word, index) => ({
			text: index === 0 ? word.text.trimStart() : word.text,
			startMs: Math.round(word.startInSeconds * 1000),
			endMs: Math.round(word.endInSeconds * 1000),
			timestampMs: Math.round(
				((word.startInSeconds + word.endInSeconds) / 2) * 1000,
			),
			confidence: null,
		})),
	};
};
