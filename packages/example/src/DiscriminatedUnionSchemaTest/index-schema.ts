import {z} from 'zod';

const discriminatedUnionRootSchema = z.discriminatedUnion('preset', [
	z.object({
		preset: z.literal('Simple'),
		track: z.string(),
		fontSize: z.number().default(48),
	}),
	z.object({
		preset: z.literal('Fancy'),
		track: z.string(),
		fontSize: z.number().default(48),
		outline: z.boolean().default(false),
	}),
]);
