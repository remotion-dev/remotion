import {zColor} from '@remotion/zod-types';
import {z} from 'zod';

export const myCompSchema = z.object({
	phoneColor: zColor(),
	deviceType: z.enum(['phone', 'tablet']),
	textureType: z.enum(['video', 'offthreadvideo']),
});
