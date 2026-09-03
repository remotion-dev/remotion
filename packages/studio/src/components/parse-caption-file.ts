import type {Caption} from '@remotion/captions';
import {parseSrt} from '@remotion/captions';
import {
	elevenLabsTranscriptToCaptions,
	isElevenLabsTranscriptJson,
	type ElevenLabsTranscript,
} from '@remotion/elevenlabs';
import {
	isOpenAiWhisperJson,
	openAiWhisperApiToCaptions,
	type OpenAiVerboseTranscription,
} from '@remotion/openai-whisper';

export type ParsedCaptionFile = {
	readonly captions: Caption[];
	readonly format:
		| 'remotion'
		| 'elevenlabs'
		| 'elevenlabs-segments'
		| 'openai-whisper'
		| 'srt';
};

const isObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isElevenLabsSegmentedJson = (value: unknown): boolean => {
	return isObject(value) && 'language_code' in value && 'segments' in value;
};

const isFiniteNumber = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};

const errorMessage = (error: unknown) => {
	return error instanceof Error ? error.message : String(error);
};

const validateCaptions = (value: unknown): Caption[] => {
	if (!Array.isArray(value)) {
		throw new Error('captions must be an array of Remotion captions.');
	}

	let previousStart: number | null = null;
	for (const [index, caption] of value.entries()) {
		const path = `captions[${index}]`;
		if (!isObject(caption)) {
			throw new Error(`${path} must be an object.`);
		}

		if (typeof caption.text !== 'string') {
			throw new Error(`${path}.text must be a string.`);
		}

		if (!isFiniteNumber(caption.startMs)) {
			throw new Error(`${path}.startMs must be a finite number.`);
		}

		if (caption.startMs < 0) {
			throw new Error(`${path}.startMs must be a non-negative number.`);
		}

		if (!isFiniteNumber(caption.endMs)) {
			throw new Error(`${path}.endMs must be a finite number.`);
		}

		if (caption.endMs < 0) {
			throw new Error(`${path}.endMs must be a non-negative number.`);
		}

		if (caption.endMs < caption.startMs) {
			throw new Error(`${path}.endMs must not be earlier than startMs.`);
		}

		if (caption.timestampMs !== null && !isFiniteNumber(caption.timestampMs)) {
			throw new Error(`${path}.timestampMs must be a finite number or null.`);
		}

		if (caption.confidence !== null && !isFiniteNumber(caption.confidence)) {
			throw new Error(`${path}.confidence must be a finite number or null.`);
		}

		if (
			typeof caption.confidence === 'number' &&
			(caption.confidence < 0 || caption.confidence > 1)
		) {
			throw new Error(`${path}.confidence must be between 0 and 1.`);
		}

		if (
			caption.pageBreakAfter !== undefined &&
			typeof caption.pageBreakAfter !== 'boolean'
		) {
			throw new Error(
				`${path}.pageBreakAfter must be a boolean when provided.`,
			);
		}

		if (previousStart !== null && caption.startMs < previousStart) {
			throw new Error(`${path}.startMs is out of timestamp order.`);
		}

		previousStart = caption.startMs;
	}

	return value as Caption[];
};

const convertSegmentedElevenLabsTranscript = (
	transcript: unknown,
): Caption[] => {
	if (!isObject(transcript) || !Array.isArray(transcript.segments)) {
		throw new Error('transcript.segments must be an array.');
	}

	const captions: Caption[] = [];
	let pendingSpacing = '';
	let pendingSpacingStart: number | null = null;
	let previousStart: number | null = null;

	for (const [segmentIndex, segment] of transcript.segments.entries()) {
		const segmentPath = `transcript.segments[${segmentIndex}]`;
		if (!isObject(segment)) {
			throw new Error(`${segmentPath} must be an object.`);
		}

		if (!Array.isArray(segment.words)) {
			throw new Error(`${segmentPath}.words must be an array.`);
		}

		for (const [wordIndex, word] of segment.words.entries()) {
			const path = `${segmentPath}.words[${wordIndex}]`;
			if (!isObject(word)) {
				throw new Error(`${path} must be an object.`);
			}

			if (typeof word.text !== 'string') {
				throw new Error(`${path}.text must be a string.`);
			}

			if (!isFiniteNumber(word.start_time)) {
				throw new Error(`${path}.start_time must be a finite number.`);
			}

			if (word.start_time < 0) {
				throw new Error(`${path}.start_time must be a non-negative number.`);
			}

			if (!isFiniteNumber(word.end_time)) {
				throw new Error(`${path}.end_time must be a finite number.`);
			}

			if (word.end_time < 0) {
				throw new Error(`${path}.end_time must be a non-negative number.`);
			}

			if (word.end_time < word.start_time) {
				throw new Error(
					`${path}.end_time must not be earlier than start_time.`,
				);
			}

			if (previousStart !== null && word.start_time < previousStart) {
				throw new Error(`${path}.start_time is out of timestamp order.`);
			}

			previousStart = word.start_time;
			if (word.text.trim() === '') {
				pendingSpacingStart ??= word.start_time;
				pendingSpacing += word.text;
				continue;
			}

			const startMs =
				captions.length > 0 && pendingSpacingStart !== null
					? pendingSpacingStart * 1000
					: word.start_time * 1000;
			const endMs = word.end_time * 1000;
			captions.push({
				confidence: null,
				startMs,
				endMs,
				text: `${pendingSpacing}${word.text}`,
				timestampMs: (startMs + endMs) / 2,
			});
			pendingSpacing = '';
			pendingSpacingStart = null;
		}
	}

	return captions;
};

export const parseCaptionFile = ({
	fileName,
	contents,
}: {
	fileName: string;
	contents: string;
}): ParsedCaptionFile => {
	const lowerCaseFileName = fileName.toLowerCase();
	if (lowerCaseFileName.endsWith('.srt')) {
		try {
			return {
				captions: validateCaptions(parseSrt({input: contents}).captions),
				format: 'srt',
			};
		} catch (error) {
			throw new Error(`Invalid SRT file: ${errorMessage(error)}`);
		}
	}

	if (!lowerCaseFileName.endsWith('.json')) {
		throw new Error('Unsupported caption file. Choose a .json or .srt file.');
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(contents);
	} catch (error) {
		throw new Error(`Invalid JSON: ${errorMessage(error)}`);
	}

	if (Array.isArray(parsed)) {
		return {captions: validateCaptions(parsed), format: 'remotion'};
	}

	if (!isObject(parsed)) {
		throw new Error(
			'Unsupported transcription JSON. Expected an object or Caption[] array.',
		);
	}

	if (isElevenLabsSegmentedJson(parsed)) {
		try {
			return {
				captions: validateCaptions(
					convertSegmentedElevenLabsTranscript(parsed),
				),
				format: 'elevenlabs-segments',
			};
		} catch (error) {
			throw new Error(
				`Detected ElevenLabs segmented JSON, but ${errorMessage(error)}`,
			);
		}
	}

	if (isElevenLabsTranscriptJson(parsed)) {
		try {
			const {captions} = elevenLabsTranscriptToCaptions({
				transcript: parsed as ElevenLabsTranscript,
			});
			return {
				captions: validateCaptions(captions),
				format: 'elevenlabs',
			};
		} catch (error) {
			throw new Error(`Detected ElevenLabs JSON, but ${errorMessage(error)}`);
		}
	}

	if (isOpenAiWhisperJson(parsed)) {
		try {
			const {captions} = openAiWhisperApiToCaptions({
				transcription: parsed as unknown as OpenAiVerboseTranscription,
			});
			return {
				captions: validateCaptions(captions),
				format: 'openai-whisper',
			};
		} catch (error) {
			throw new Error(
				`Detected OpenAI Whisper JSON, but ${errorMessage(error)}`,
			);
		}
	}

	const keys = Object.keys(parsed);
	throw new Error(
		`Unsupported transcription JSON. Found top-level keys: ${keys.length === 0 ? '(none)' : keys.join(', ')}.`,
	);
};
