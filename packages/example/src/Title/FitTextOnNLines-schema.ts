import {fitTextOnNLines, measureText} from '@remotion/layout-utils';
import {z} from 'zod';

const fitTextOnNLinesSchema = z.object({
	text: z.string(),
	maxLines: z.number().step(1),
	textAlign: z.enum(['left', 'center', 'right']),
});
