import {z} from 'zod';

const hugePayloadSchema = z.object({
	str: z.string(),
	date: z.date(),
	file: z.string(),
});
