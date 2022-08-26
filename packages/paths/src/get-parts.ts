import {construct} from './helpers/construct';
import type {PartProperties} from './helpers/types';

export const getParts = (p: string) => {
	const parts = [];
	const constructed = construct(p);

	let i = 0;
	for (const fn of constructed.functions) {
		if (!fn) {
			continue;
		}

		const properties: PartProperties = {
			start: fn.getPointAtLength(0),
			end: fn.getPointAtLength(
				constructed.partial_lengths[i] - constructed.partial_lengths[i - 1]
			),
			length:
				constructed.partial_lengths[i] - constructed.partial_lengths[i - 1],
			getPointAtLength: fn.getPointAtLength,
			getTangentAtLength: fn.getTangentAtLength,
			getPropertiesAtLength: fn.getPropertiesAtLength,
		};
		i++;
		parts.push(properties);
	}

	return parts;
};
