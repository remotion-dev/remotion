import {parseSrt, type Caption} from '@remotion/captions';
import {
	detectElevenLabsTranscriptFormat,
	elevenLabsTranscriptToCaptions,
} from '@remotion/elevenlabs';
import {
	isOpenAiWhisperTranscript,
	openAiWhisperApiToCaptions,
} from '@remotion/openai-whisper';

const isObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isFiniteNumber = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};

export const parseCaptionFile = ({
	fileName,
	contents,
}: {
	fileName: string;
	contents: string;
}): Caption[] => {
	const name = fileName.toLowerCase();
	if (!name.endsWith('.json') && !name.endsWith('.srt')) {
		throw new Error('Unsupported caption file. Choose a .json or .srt file.');
	}

	let parsed: unknown;
	let canonical = false;
	if (name.endsWith('.srt')) {
		parsed = parseSrt({input: contents, strict: true}).captions;
	} else {
		try {
			parsed = JSON.parse(contents.replace(/^\uFEFF/, ''));
		} catch (error) {
			throw new Error(
				`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		if (Array.isArray(parsed)) {
			canonical = true;
		} else {
			const elevenLabs = detectElevenLabsTranscriptFormat(parsed);
			const whisper = isOpenAiWhisperTranscript(parsed);
			if (elevenLabs && whisper) {
				throw new Error(
					'Ambiguous transcript: matches both ElevenLabs and OpenAI Whisper signatures. Remove conflicting provider fields.',
				);
			}

			if (elevenLabs) {
				parsed = elevenLabsTranscriptToCaptions({transcript: parsed}).captions;
			} else if (whisper) {
				parsed = openAiWhisperApiToCaptions({transcription: parsed}).captions;
			} else {
				throw new Error(
					'Unsupported JSON shape. Expected Remotion Caption[], ElevenLabs Speech-to-Text or segmented JSON, or OpenAI Whisper verbose JSON with timed words or segments.',
				);
			}
		}
	}

	if (!Array.isArray(parsed)) {
		throw new Error('Expected a Remotion Caption[] JSON array.');
	}

	if (!canonical && parsed.length === 0) {
		throw new Error(
			'No timed captions found. Export word or segment timestamps, or choose a caption file with timed cues.',
		);
	}

	let previousStart: number | null = null;
	for (const [index, caption] of parsed.entries()) {
		const path = `captions[${index}]`;
		if (!isObject(caption)) {
			throw new Error(`${path} must be an object.`);
		}

		if (typeof caption.text !== 'string') {
			throw new Error(`${path}.text must be a string.`);
		}

		if (!isFiniteNumber(caption.startMs) || caption.startMs < 0) {
			throw new Error(`${path}.startMs must be a finite, non-negative number.`);
		}

		if (!isFiniteNumber(caption.endMs) || caption.endMs < 0) {
			throw new Error(`${path}.endMs must be a finite, non-negative number.`);
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

	return parsed as Caption[];
};
