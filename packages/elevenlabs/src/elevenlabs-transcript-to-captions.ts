import type {Caption} from '@remotion/captions';
import type {ElevenLabsTranscript} from './elevenlabs-transcript';

export type ElevenLabsTranscriptToCaptionsInput = {
	transcript: ElevenLabsTranscript;
};

export type ElevenLabsTranscriptToCaptionsOutput = {
	captions: Caption[];
};

export const isElevenLabsTranscriptJson = (value: unknown): boolean => {
	return (
		typeof value === 'object' &&
		value !== null &&
		!Array.isArray(value) &&
		'language_code' in value &&
		('words' in value || 'text' in value)
	);
};

export const elevenLabsTranscriptToCaptions = ({
	transcript,
}: ElevenLabsTranscriptToCaptionsInput): ElevenLabsTranscriptToCaptionsOutput => {
	const captions: Caption[] = [];

	if (
		typeof transcript !== 'object' ||
		transcript === null ||
		Array.isArray(transcript)
	) {
		throw new Error(
			'Invalid ElevenLabs transcript: transcript must be an object.',
		);
	}

	const {words}: {words: unknown} = transcript;
	if (!Array.isArray(words)) {
		throw new Error(
			'Invalid ElevenLabs transcript: words must be an array generated with `timestamps_granularity` set to `"word"`. See https://www.remotion.dev/docs/elevenlabs/elevenlabs-transcript-to-captions',
		);
	}

	let isFirst = true;

	for (let i = 0; i < words.length; i++) {
		const value: unknown = words[i];
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			throw new Error(
				`Invalid ElevenLabs transcript: words[${i}] must be an object.`,
			);
		}

		const entry = value as Record<string, unknown>;
		if (entry.type !== 'word') {
			continue;
		}

		if (typeof entry.text !== 'string') {
			throw new Error(
				`Invalid ElevenLabs transcript: words[${i}].text must be a string.`,
			);
		}

		if (
			typeof entry.start !== 'number' ||
			!Number.isFinite(entry.start) ||
			entry.start < 0
		) {
			throw new Error(
				`Invalid ElevenLabs transcript: words[${i}].start must be a finite, non-negative number.`,
			);
		}

		if (
			typeof entry.end !== 'number' ||
			!Number.isFinite(entry.end) ||
			entry.end < 0
		) {
			throw new Error(
				`Invalid ElevenLabs transcript: words[${i}].end must be a finite, non-negative number.`,
			);
		}

		if (entry.end < entry.start) {
			throw new Error(
				`Invalid ElevenLabs transcript: words[${i}].end must not be earlier than words[${i}].start.`,
			);
		}

		let spacingStart: number | null = null;
		const previousValue: unknown = i > 0 ? words[i - 1] : null;
		if (
			!isFirst &&
			typeof previousValue === 'object' &&
			previousValue !== null &&
			!Array.isArray(previousValue)
		) {
			const previousEntry = previousValue as Record<string, unknown>;
			if (previousEntry.type === 'spacing') {
				if (
					typeof previousEntry.start !== 'number' ||
					!Number.isFinite(previousEntry.start) ||
					previousEntry.start < 0
				) {
					throw new Error(
						`Invalid ElevenLabs transcript: words[${i - 1}].start must be a finite, non-negative number.`,
					);
				}

				spacingStart = previousEntry.start;
			}
		}

		const startMs = (spacingStart ?? entry.start) * 1000;
		const endMs = entry.end * 1000;
		if (endMs < startMs) {
			throw new Error(
				`Invalid ElevenLabs transcript: words[${i}].end must not be earlier than the caption start.`,
			);
		}

		if (
			captions.length > 0 &&
			startMs < captions[captions.length - 1].startMs
		) {
			throw new Error(
				`Invalid ElevenLabs transcript: words[${i}].start is out of timestamp order.`,
			);
		}

		const text = isFirst ? entry.text : ` ${entry.text}`;

		captions.push({
			confidence: null,
			startMs,
			endMs,
			text,
			timestampMs: (startMs + endMs) / 2,
		});

		isFirst = false;
	}

	return {captions};
};
