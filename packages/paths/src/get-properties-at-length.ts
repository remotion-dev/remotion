import {getPartAtLength} from './get-length';
import {construct} from './helpers/construct';

export const getPropertiesAtLength = (p: string, fractionLength: number) => {
	const constructed = construct(p);

	const fractionPart = getPartAtLength(p, fractionLength);
	const functionAtPart = constructed.functions[fractionPart.i];
	if (functionAtPart) {
		return functionAtPart.getPropertiesAtLength(fractionPart.fraction);
	}

	if (constructed.initial_point) {
		return {
			x: constructed.initial_point.x,
			y: constructed.initial_point.y,
			tangentX: 0,
			tangentY: 0,
		};
	}

	throw new Error('Wrong function at this part.');
};
