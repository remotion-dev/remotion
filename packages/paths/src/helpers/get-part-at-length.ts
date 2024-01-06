import type {Constructed} from './construct';

type SegmentAtLength = {
	index: number;
	fraction: number;
};

export const getSegmentAtLength = (
	constructed: Constructed,
	fractionLength: number,
): SegmentAtLength => {
	if (fractionLength < 0) {
		fractionLength = 0;
	} else if (fractionLength > constructed.length) {
		fractionLength = constructed.length;
	}

	let index = constructed.partialLengths.length - 1;

	while (constructed.partialLengths[index] >= fractionLength && index > 0) {
		index--;
	}

	index++;
	return {
		fraction: fractionLength - constructed.partialLengths[index - 1],
		index,
	};
};
