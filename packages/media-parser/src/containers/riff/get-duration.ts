import type {RiffStructure} from './riff-box';
import {getStrhBox, getStrlBoxes} from './traversal';

export const getDurationFromAvi = (structure: RiffStructure) => {
	const strl = getStrlBoxes(structure);

	const lengths: number[] = [];
	for (const s of strl) {
		const strh = getStrhBox(s.children);
		if (!strh) {
			throw new Error('No strh box');
		}

		const samplesPerSecond = strh.rate / strh.scale;

		const streamLength = strh.length / samplesPerSecond;
		lengths.push(streamLength);
	}

	return Math.max(...lengths);
};

export const getSampleRateFromAvi = (structure: RiffStructure) => {
	const strl = getStrlBoxes(structure);

	for (const s of strl) {
		const strh = getStrhBox(s.children);
		if (!strh) {
			throw new Error('No strh box');
		}

		if (strh.strf.type === 'strf-box-audio') {
			return strh.strf.sampleRate;
		}
	}

	return null;
};
