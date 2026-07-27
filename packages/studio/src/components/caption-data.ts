import {z} from 'zod';

const captionSchema = z.object({
	text: z.string(),
	startMs: z.number().finite(),
	endMs: z.number().finite(),
	timestampMs: z.number().finite().nullable(),
	confidence: z.number().finite().nullable(),
});

export const captionDataSchema = z.array(captionSchema);

export type CaptionData = z.infer<typeof captionSchema>;
