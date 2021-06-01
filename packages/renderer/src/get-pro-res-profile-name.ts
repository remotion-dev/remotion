import {ProResProfile} from 'remotion';

export const getProResProfileName = (
	proResProfile: ProResProfile | undefined
): string | null => {
	switch (proResProfile) {
		case '4444-xq':
			return '5';
		case '4444':
			return '4';
		case 'hq':
			return '3';
		case 'standard':
			return '2';
		case 'light':
			return '1';
		case 'proxy':
			return '0';
		default:
			return null;
	}
};
