import * as z from 'zod/mini';

// Recognition deliberately uses permissive schemas; conversion validates the fields.
const stt = z.object({language_code: z.unknown(), words: z.unknown()});
const sttWithId = z.object({transcription_id: z.unknown(), words: z.unknown()});
const segmented = z.object({
	language_code: z.unknown(),
	segments: z.unknown(),
});

export const detectElevenLabsTranscriptFormat = (
	input: unknown,
): 'speech-to-text' | 'segmented' | null => {
	if (
		z.safeParse(stt, input).success ||
		z.safeParse(sttWithId, input).success
	) {
		return 'speech-to-text';
	}

	if (z.safeParse(segmented, input).success) {
		return 'segmented';
	}

	return null;
};
