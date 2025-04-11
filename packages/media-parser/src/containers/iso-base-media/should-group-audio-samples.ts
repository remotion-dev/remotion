import {
	isIn24AudioCodec,
	isLpcmAudioCodec,
	isTwosAudioCodec,
} from '../../get-audio-codec';
import type {TrakBox} from './trak/trak';

type ShouldGroup = {
	bigEndian: boolean;
};

export const shouldGroupAudioSamples = (
	trakBox: TrakBox,
): ShouldGroup | null => {
	const isLpcm = isLpcmAudioCodec(trakBox);
	const isIn24 = isIn24AudioCodec(trakBox);
	const isTwos = isTwosAudioCodec(trakBox);

	if (isLpcm || isIn24 || isTwos) {
		return {
			bigEndian: isTwos || isIn24,
		};
	}

	return null;
};
