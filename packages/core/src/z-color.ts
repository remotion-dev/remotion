import {z} from 'zod';

export const REMOTION_COLOR_BRAND = '__remotion-color';

export const zColor = () => z.string().describe(REMOTION_COLOR_BRAND);
