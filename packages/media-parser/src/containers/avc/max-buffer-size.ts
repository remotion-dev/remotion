import type {SpsInfo} from './parse-avc';

// https://www.itu.int/rec/T-REC-H.264-202408-I
// Table A-1 – Level limits
const maxMacroblocksByLevel: Record<number, number> = {
	10: 396, // Level 1.0
	11: 900, // Level 1.1
	12: 2376, // Level 1.2
	13: 2376, // Level 1.3
	20: 2376, // Level 2.0
	21: 4752, // Level 2.1
	22: 8100, // Level 2.2
	30: 8100, // Level 3.0
	31: 18000, // Level 3.1
	32: 20480, // Level 3.2
	40: 32768, // Level 4.0
	41: 32768, // Level 4.1
	42: 34816, // Level 4.2
	50: 110400, // Level 5.0
	51: 184320, // Level 5.1
	52: 184320, // Level 5.2
	60: 696320, // Level 6.0
	61: 696320, // Level 6.1
	62: 696320, // Level 6.2
};

export const macroBlocksPerFrame = (sps: SpsInfo) => {
	const {pic_width_in_mbs_minus1, pic_height_in_map_units_minus1} = sps;
	return (pic_width_in_mbs_minus1 + 1) * (pic_height_in_map_units_minus1 + 1);
};

export const maxMacroblockBufferSize = (sps: SpsInfo) => {
	const {level} = sps;
	const maxMacroblocks = maxMacroblocksByLevel[level];
	if (maxMacroblocks === undefined) {
		throw new Error(`Unsupported level: ${level.toString(16)}`);
	}

	return maxMacroblocks;
};
