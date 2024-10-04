import {Caption} from '@remotion/captions';
import {OpenAiVerboseTranscription} from './openai-format';

export type OpenAiToCaptionsInput = {
	transcription: OpenAiVerboseTranscription;
};

export type OpenAiToCaptionsOutput = {
	captions: Caption[];
};

export const openAiWhisperApiToCaptions = ({
	transcription,
}: OpenAiToCaptionsInput): OpenAiToCaptionsOutput => {
	let captions: Caption[] = [];
	if (!transcription.words) {
		throw new Error(
			'The transcription does need to be been generated with `timestamp_granularities: ["word"]`',
		);
	}

	let remainingText = transcription.text;

	for (const word of transcription.words) {
		const match = new RegExp(`^(^.{0,4})${word.word}([\\?\,\\.]{0,3})?`).exec(
			remainingText,
		);
		if (!match) {
			throw new Error(
				`Unable to parse punctuation from OpenAI Whisper output. Could not find word "${word.word}" in text "${remainingText.slice(0, 100)}". File an issue under https://remotion.dev/issue to ask for a fix.`,
			);
		}
		const foundText = match[0];
		remainingText = remainingText.slice(foundText.length);

		captions.push({
			confidence: null,
			endMs: word.end * 1000,
			startMs: word.start * 1000,
			text: foundText,
			timestampMs: ((word.start + word.end) / 2) * 1000,
		});
	}

	return {captions};
};
