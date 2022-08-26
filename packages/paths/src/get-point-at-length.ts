import {getPartAtLength} from './get-part-at-length';
import {construct} from './helpers/construct';

export const getPointAtLength = (p: string, fractionLength: number) => {
	const constructed = construct(p);
	const fractionPart = getPartAtLength(p, fractionLength);
	const functionAtPart = constructed.functions[fractionPart.i];

	if (functionAtPart) {
		return functionAtPart.getPointAtLength(fractionPart.fraction);
	}

	if (constructed.initial_point) {
		return constructed.initial_point;
	}

	throw new Error('Wrong function at this part.');
};
