import {z} from 'zod';

const saveStudioSchema = z.object({
	color: z.string(),
});
