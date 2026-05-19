import {fitText} from '@remotion/layout-utils';
import {z} from 'zod';

const fitTextSchema = z.object({
	line: z.string(),
});
