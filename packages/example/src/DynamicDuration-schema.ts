import {z} from 'zod';

const dynamicDurationSchema = z.object({
	duration: z.number().min(1).max(1000).default(100),
});
