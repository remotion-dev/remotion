import {isLpcmAudioCodec} from '../../get-audio-codec';
import {getTimescaleAndDuration} from '../../get-fps';
import type {SamplePosition} from '../../get-sample-positions';
import {getSamplePositions} from '../../get-sample-positions';
import {getSamplePositionsFromLpcm} from '../../get-sample-positions-from-lpcm';
import {getSamplesFromMoof} from '../../samples-from-moof';
import type {IsoBaseMediaBox} from './base-media-box';
import type {TrakBox} from './trak/trak';
import {
	getCttsBox,
	getStcoBox,
	getStscBox,
	getStssBox,
	getStszBox,
	getSttsBox,
	getTkhdBox,
} from './traversal';

export const getSamplePositionsFromTrack = ({
	trakBox,
	moofBoxes,
}: {
	trakBox: TrakBox;
	moofBoxes: IsoBaseMediaBox[];
}): SamplePosition[] => {
	const isLpcm = isLpcmAudioCodec(trakBox);
	const timescaleAndDuration = getTimescaleAndDuration(trakBox);

	if (isLpcm) {
		return getSamplePositionsFromLpcm(trakBox);
	}

	const stszBox = getStszBox(trakBox);
	const stcoBox = getStcoBox(trakBox);
	const stscBox = getStscBox(trakBox);
	const stssBox = getStssBox(trakBox);
	const sttsBox = getSttsBox(trakBox);
	const tkhdBox = getTkhdBox(trakBox);
	const cttsBox = getCttsBox(trakBox);

	if (!tkhdBox) {
		throw new Error('Expected tkhd box in trak box');
	}

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

	let samplePositions = getSamplePositions({
		stcoBox,
		stscBox,
		stszBox,
		stssBox,
		sttsBox,
		cttsBox,
	});

	if (samplePositions.length === 0 && moofBoxes.length > 0) {
		samplePositions = moofBoxes
			.map((m) => {
				return getSamplesFromMoof({moofBox: m, trackId: tkhdBox.trackId});
			})
			.flat(1);
	}

	return samplePositions;
};
