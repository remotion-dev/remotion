import {Caption} from '@remotion/captions';
import {OpenAiVerboseTranscription} from './openai-format';

export type OpenAiToCaptionsInput = {
	transcription: OpenAiVerboseTranscription;
};

export type OpenAiToCaptionsOutput = {
	captions: Caption[];
};

export const openAiWhisperApiToCaptions = (
	input: OpenAiToCaptionsInput,
): OpenAiToCaptionsOutput => {
	let captions: Caption[] = [];
	if (!input.transcription.words) {
		throw new Error(
			'The transcription does need to be been generated with `timestamp_granularities: ["word"]`',
		);
	}

	for (const word of input.transcription.words) {
		captions.push({
			confidence: null,
			endMs: word.end * 1000,
			startMs: word.start * 1000,
			text: word.word,
			timestampMs: ((word.start + word.end) / 2) * 1000,
		});
	}

	return {captions};
};
