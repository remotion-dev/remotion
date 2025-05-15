import type {SpsInfo} from './parse-avc';

const maxMacroblocksByLevel: Record<number, number> = {
	0x0a: 396,
	0x0b: 396,
	0x0c: 900,
	0x0d: 2376,
	0x0e: 2376,
	0x15: 2376,
	0x16: 4752,
	0x1e: 8118,
	0x20: 8100,
	0x28: 18000,
	0x29: 20480,
	0x32: 32768,
	0x33: 32768,
	0x3c: 34816,
	0x42: 110400,
	0x4d: 184320,
	0x50: 184320,
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
