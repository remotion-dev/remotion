import {isIn24AudioCodec, isLpcmAudioCodec} from '../../get-audio-codec';
import {getTimescaleAndDuration} from '../../get-fps';
import {getSamplePositions} from '../../get-sample-positions';
import {getGroupedSamplesPositionsFromMp4} from '../../get-sample-positions-from-mp4';
import type {TrakBox} from './trak/trak';
import {
	getCttsBox,
	getStcoBox,
	getStscBox,
	getStssBox,
	getStszBox,
	getSttsBox,
} from './traversal';

export const collectSamplePositionsFromTrak = (trakBox: TrakBox) => {
	const isLpcm = isLpcmAudioCodec(trakBox);
	const timescaleAndDuration = getTimescaleAndDuration(trakBox);
	const isIn24 = isIn24AudioCodec(trakBox);

	if (isLpcm || isIn24) {
		return getGroupedSamplesPositionsFromMp4(trakBox);
	}

	const stszBox = getStszBox(trakBox);
	const stcoBox = getStcoBox(trakBox);
	const stscBox = getStscBox(trakBox);
	const stssBox = getStssBox(trakBox);
	const sttsBox = getSttsBox(trakBox);
	const cttsBox = getCttsBox(trakBox);

	if (!stszBox) {
		throw new Error('Expected stsz box in trak box');
	}

	if (!stcoBox) {
		throw new Error('Expected stco box in trak box');
	}

	if (!stscBox) {
		throw new Error('Expected stsc box in trak box');
	}

	if (!sttsBox) {
		throw new Error('Expected stts box in trak box');
	}

	if (!timescaleAndDuration) {
		throw new Error('Expected timescale and duration in trak box');
	}

	const samplePositions = getSamplePositions({
		stcoBox,
		stscBox,
		stszBox,
		stssBox,
		sttsBox,
		cttsBox,
	});

	return samplePositions;
};
