import type {M3u8SeekingHints} from '../../seeking-hints';
import type {SeekResolution} from '../../work-on-seek-request';

export const getSeekingByteForM3u8 = ({
	time,
	seekingHints,
}: {
	time: number;
	seekingHints: M3u8SeekingHints;
}): SeekResolution => {
	return {
		type: 'valid-but-must-wait',
	};
};
