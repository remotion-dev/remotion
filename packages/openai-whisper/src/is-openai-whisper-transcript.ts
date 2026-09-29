import * as z from 'zod/mini';

// Permissive signatures, not proof that the transcript is valid.
const withTask = z.object({task: z.unknown()});
const withWords = z.object({
	text: z.unknown(),
	language: z.unknown(),
	words: z.unknown(),
});
const withDuration = z.object({
	text: z.unknown(),
	duration: z.unknown(),
	segments: z.unknown(),
});
const withSegments = z.object({
	text: z.unknown(),
	language: z.unknown(),
	segments: z.unknown(),
});

export const isOpenAiWhisperTranscript = (input: unknown): boolean => {
	return (
		z.safeParse(withTask, input).success ||
		z.safeParse(withWords, input).success ||
		z.safeParse(withDuration, input).success ||
		z.safeParse(withSegments, input).success
	);
};
