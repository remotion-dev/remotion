import {ZodZypesInternals} from '@remotion/zod-types';
import {z} from 'zod';

const {REMOTION_TEXTAREA_BRAND} = ZodZypesInternals;

export const zTextarea = () => z.string().describe(REMOTION_TEXTAREA_BRAND);
