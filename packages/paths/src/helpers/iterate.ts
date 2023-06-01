import type {AbsoluteInstruction, ReducedInstruction} from './types';

export const iterateOverSegments = <T extends ReducedInstruction>({
	segments,
	iterate,
}: {
	segments: AbsoluteInstruction[];
	iterate: (options: {
		segment: AbsoluteInstruction;
		prevSegment: AbsoluteInstruction | null;
		x: number;
		y: number;
		initialX: number;
		initialY: number;
		cpX: number | null;
		cpY: number | null;
	}) => T[];
}): T[] => {
	let x = 0;
	let y = 0;
	let initialX = 0;
	let initialY = 0;
	let cpX: null | number = null;
	let cpY: null | number = null;

	const newSegments = segments.map((s, i) => {
		const newSeg = iterate({
			segment: s,
			x,
			y,
			prevSegment: segments[i - 1] ?? null,
			initialX,
			initialY,
			cpX,
			cpY,
		});
		switch (s.type) {
			case 'M':
				initialX = s.x;
				initialY = s.y;
				x = s.x;
				y = s.y;
				cpX = null;
				cpY = null;
				break;
			case 'Q':
				x = s.x;
				y = s.y;
				cpX = s.cpx;
				cpY = s.cpy;
				break;
			case 'A':
				x = s.x;
				y = s.y;
				cpX = null;
				cpY = null;
				break;
			case 'C':
				x = s.x;
				y = s.y;
				cpX = s.cp2x;
				cpY = s.cp2y;
				break;
			case 'S':
				x = s.x;
				y = s.y;
				cpX = s.cpx;
				cpY = s.cpy;
				break;
			case 'T':
				// Order of if statement is important here
				if (cpX !== null && cpY !== null) {
					cpX = x - (cpX - x);
					cpY = y - (cpY - y);
				}

				x = s.x;
				y = s.y;

				break;
			case 'L':
				x = s.x;
				y = s.y;
				cpX = null;
				cpY = null;
				break;
			case 'V':
				y = s.y;
				cpX = null;
				cpY = null;
				break;
			case 'H':
				x = s.x;
				cpX = null;
				cpY = null;
				break;
			case 'Z':
				x = initialX;
				y = initialY;
				cpX = null;
				cpY = null;
				break;

			default:
				// @ts-expect-error
				throw new Error(`Unexpected instruction ${s.type}`);
		}

		return newSeg;
	});
	return newSegments.flat(1);
};
