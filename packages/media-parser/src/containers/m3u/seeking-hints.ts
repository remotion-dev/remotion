import type {M3u8SeekingHints} from '../../seeking-hints';

export const getSeekingHintsForM3u = (): M3u8SeekingHints => {
	return {
		type: 'm3u8-seeking-hints',
	};
};
