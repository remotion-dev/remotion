import type {Caption} from '@remotion/captions';
import type {OpenAiVerboseTranscription} from './openai-format';

export type OpenAiToCaptionsInput = {
	transcription: OpenAiVerboseTranscription;
};

export type OpenAiToCaptionsOutput = {
	captions: Caption[];
};

export const isOpenAiWhisperJson = (value: unknown): boolean => {
	return (
		typeof value === 'object' &&
		value !== null &&
		!Array.isArray(value) &&
		!('language_code' in value) &&
		'text' in value &&
		('task' in value ||
			'language' in value ||
			'duration' in value ||
			'segments' in value ||
			'words' in value)
	);
};

const escapeRegex = (text: string) => {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const apostropheVariants = ['\u0027', '\u2018', '\u2019', '\u02bc', '\uff07'];
const apostropheVariantRegex = `[${apostropheVariants.map(escapeRegex).join('')}]`;

const escapeWordForRegex = (text: string) => {
	return Array.from(text)
		.map((character) => {
			return apostropheVariants.includes(character)
				? apostropheVariantRegex
				: escapeRegex(character);
		})
		.join('');
};

export const openAiWhisperApiToCaptions = ({
	transcription,
}: OpenAiToCaptionsInput): OpenAiToCaptionsOutput => {
	const captions: Caption[] = [];

	if (
		typeof transcription !== 'object' ||
		transcription === null ||
		Array.isArray(transcription)
	) {
		throw new Error(
			'Invalid OpenAI Whisper transcription: transcription must be an object.',
		);
	}

	if (transcription.task && transcription.task !== 'transcribe') {
		throw new Error(
			`Invalid OpenAI Whisper transcription: The transcription does need to be a "transcribe" task. The input you gave is "task": "${transcription.task}"`,
		);
	}

	if (!transcription.words) {
		throw new Error(
			'Invalid OpenAI Whisper transcription: The transcription does need to be been generated with `timestamp_granularities: ["word"]`',
		);
	}

	const {words} = transcription as unknown as {words: unknown};
	if (!Array.isArray(words)) {
		throw new Error(
			'Invalid OpenAI Whisper transcription: words must be an array.',
		);
	}

	if (typeof transcription.text !== 'string') {
		throw new Error(
			'Invalid OpenAI Whisper transcription: text must be a string.',
		);
	}

	let remainingText = transcription.text;
	let previousStart: number | null = null;

	for (let i = 0; i < words.length; i++) {
		const value: unknown = words[i];
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			throw new Error(
				`Invalid OpenAI Whisper transcription: words[${i}] must be an object.`,
			);
		}

		const word = value as Record<string, unknown>;
		if (typeof word.word !== 'string') {
			throw new Error(
				`Invalid OpenAI Whisper transcription: words[${i}].word must be a string.`,
			);
		}

		if (
			typeof word.start !== 'number' ||
			!Number.isFinite(word.start) ||
			word.start < 0
		) {
			throw new Error(
				`Invalid OpenAI Whisper transcription: words[${i}].start must be a finite, non-negative number.`,
			);
		}

		if (
			typeof word.end !== 'number' ||
			!Number.isFinite(word.end) ||
			word.end < 0
		) {
			throw new Error(
				`Invalid OpenAI Whisper transcription: words[${i}].end must be a finite, non-negative number.`,
			);
		}

		if (word.end < word.start) {
			throw new Error(
				`Invalid OpenAI Whisper transcription: words[${i}].end must not be earlier than words[${i}].start.`,
			);
		}

		if (previousStart !== null && word.start < previousStart) {
			throw new Error(
				`Invalid OpenAI Whisper transcription: words[${i}].start is out of timestamp order.`,
			);
		}

		previousStart = word.start;
		const firstWord = i === 0;
		// https://github.com/remotion-dev/remotion/issues/5031
		const wordText = firstWord ? word.word.trimStart() : word.word;
		if (firstWord) {
			word.word = wordText;
		}

		const punctuation = `\\?,\\.\\%\\–\\!\\;\\:\\'\\"\\-\\_\\(\\)\\[\\]\\{\\}\\@\\#\\$\\^\\&\\*\\+\\=\\/\\|\\<\\>\\~\`\\u2018\\u2019\\u02bc\\uff07`;
		const wordToMatch = wordText.replace(new RegExp(`^[${punctuation}]+`), '');
		const match = new RegExp(
			`^([\\s?${punctuation}]{0,4})${escapeWordForRegex(wordToMatch)}([${punctuation}]{0,3})?`,
		).exec(remainingText);
		if (!match) {
			throw new Error(
				`Unable to parse punctuation from OpenAI Whisper output. Could not find word "${wordText}" in text "${remainingText.slice(0, 100)}". File an issue under https://remotion.dev/issue and post the input for openAiWhisperApiToCaptions() to ask for a fix.`,
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
