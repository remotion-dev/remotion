// Copied from: https://github.com/rveciana/svg-path-properties

import {construct} from './helpers/construct';
import type {PartProperties} from './helpers/types';

export const getLength = (p: string) => {
	const constructucted = construct(p);
	return constructucted.length;
};

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
