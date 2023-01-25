// Copied from: https://github.com/rveciana/svg-path-properties

import type {pathOrders} from './types';

const length: {[key in pathOrders]: number} = {
	a: 7,
	c: 6,
	h: 1,
	l: 2,
	m: 2,
	q: 4,
	s: 4,
	t: 2,
	v: 1,
	z: 0,
};
const segmentRegExp = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
const numberRegExp = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;

export type Instruction = [string, ...number[]];

export const parsePath = (path: string): Instruction[] => {
	const segments = (path && path.length > 0 ? path : 'M0,0').match(
		segmentRegExp
	);
	if (!segments) {
		throw new Error(`No path elements found in string ${path}`);
	}

	return segments.reduce(
		(segmentsArray: [string, ...Array<number>][], segmentString: string) => {
			let command = segmentString.charAt(0);
			let type: pathOrders = command.toLowerCase() as pathOrders;
			const args = parseValues(segmentString.substr(1));

			// overloaded moveTo
			if (type === 'm' && args.length > 2) {
				segmentsArray.push([command, ...args.splice(0, 2)]);
				type = 'l';
				command = command === 'm' ? 'l' : 'L';
			}

			while (args.length >= 0) {
				if (args.length === length[type]) {
					segmentsArray.push([command, ...args.splice(0, length[type])]);
					break;
				}

				if (args.length < length[type]) {
					throw new Error(
						`Malformed path data: "${command}" must have ${length[type]} elements and has ${args.length}: ${segmentString}`
					);
				}

				segmentsArray.push([command, ...args.splice(0, length[type])]);
			}

			return segmentsArray;
		},
		[]
	);
};

const parseValues = (args: string) => {
	const numbers = args.match(numberRegExp);
	return numbers ? numbers.map(Number) : [];
};
