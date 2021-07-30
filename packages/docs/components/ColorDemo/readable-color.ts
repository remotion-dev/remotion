import { getLuminance } from 'polished';

export const getReadableColor = (color: string): string => {
	const luminance = getLuminance(color);
	return luminance > 0.3 ? '#000' : '#fff';
};
