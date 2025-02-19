import type {Caption} from '@remotion/captions';
import type {OpenAiVerboseTranscription} from './openai-format';

export type OpenAiToCaptionsInput = {
	transcription: OpenAiVerboseTranscription;
};

export type OpenAiToCaptionsOutput = {
	captions: Caption[];
};

export const openAiWhisperApiToCaptions = ({
	transcription,
}: OpenAiToCaptionsInput): OpenAiToCaptionsOutput => {
	const captions: Caption[] = [];

	if (!transcription.words) {
		if (transcription.task && transcription.task !== 'transcribe') {
			throw new Error(
				`The transcription does need to be a "transcribe" task. The input you gave is "task": "${transcription.task}"`,
			);
		}

		throw new Error(
			'The transcription does need to be been generated with `timestamp_granularities: ["word"]`',
		);
	}

	let remainingText = transcription.text;

	for (const word of transcription.words) {
		const punctuation = `\\?,\\.\\%\\–\\!\\;\\:\\'\\"\\-\\_\\(\\)\\[\\]\\{\\}\\@\\#\\$\\^\\&\\*\\+\\=\\/\\|\\<\\>\\~\``;
		const match = new RegExp(
			`^([\\s${punctuation}]{0,4})${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([${punctuation}]{0,3})?`,
		).exec(remainingText);
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
