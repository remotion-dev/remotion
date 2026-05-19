import {zColor} from '@remotion/zod-types';
import {z} from 'zod';

const betaTextSchema = z.object({
	word1: z.string(),
	color: z.array(zColor()),
});
