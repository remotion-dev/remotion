import {construct} from './construct';

export const getPartAtLength = (p: string, fractionLength: number) => {
	const constructed = construct(p);
	if (fractionLength < 0) {
		fractionLength = 0;
	} else if (fractionLength > constructed.length) {
		fractionLength = constructed.length;
	}

	let i = constructed.partial_lengths.length - 1;

	while (constructed.partial_lengths[i] >= fractionLength && i > 0) {
		i--;
	}

	i++;
	return {fraction: fractionLength - constructed.partial_lengths[i - 1], i};
};
