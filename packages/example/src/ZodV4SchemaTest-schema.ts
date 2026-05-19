import {z} from 'zod/v4';

const zodV4Schema = z.object({
	greeting: z.string().default('Hello from Zod v4!'),
	count: z.number().min(0).max(100),
	enabled: z.boolean(),
	items: z.array(z.object({label: z.string(), value: z.number()})),
	mode: z.enum(['light', 'dark']),
	optional: z.string().optional(),
	nested: z.object({
		a: z.string(),
		b: z.number(),
	}),
});
