import type {_InternalTypes} from 'remotion';
import type {Codec} from './codec';

export const getProResProfileName = (
	codec: Codec,
	proResProfile: _InternalTypes['ProResProfile'] | undefined,
): string | null => {
	if (codec !== 'prores') {
		return null;
	}

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
			return '3';
	}
};
