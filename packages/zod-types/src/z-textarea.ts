import {z} from 'zod';

export const REMOTION_TEXTAREA_BRAND = '__remotion-textarea';

export const zTextarea = () => z.string().describe(REMOTION_TEXTAREA_BRAND);
