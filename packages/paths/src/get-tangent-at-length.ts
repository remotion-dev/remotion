import {construct} from './helpers/construct';

export const getTangentAtLength = (p: string, fractionLength: number) => {
	const constructed = construct(p);

	const fractionPart = getPartAtLength(p, fractionLength);
	const functionAtPart = constructed.functions[fractionPart.i];
	if (functionAtPart) {
		return functionAtPart.getTangentAtLength(fractionPart.fraction);
	}

	if (constructed.initial_point) {
		return {x: 0, y: 0};
	}

	throw new Error('Wrong function at this part.');
};
