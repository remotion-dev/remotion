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
	}) => T[];
}): T[] => {
	let x = 0;
	let y = 0;
	let initialX = 0;
	let initialY = 0;

	const newSegments = segments.map((s, i) => {
		const newSeg = iterate({
			segment: s,
			x,
			y,
			prevSegment: segments[i - 1] ?? null,
			initialX,
			initialY,
		});
		switch (s.type) {
			case 'M':
				initialX = s.x;
				initialY = s.y;
			// fallthrough
			case 'A':
			case 'C':
			case 'Q':
			case 'S':
			case 'T':
			case 'L': {
				x = s.x;
				y = s.y;
				break;
			}

			case 'V': {
				y = s.y;
				break;
			}

			case 'H': {
				x = s.x;
				break;
			}

			case 'Z': {
				break;
			}

			default:
				// @ts-expect-error
				throw new Error(`Unexpected instruction ${s.type}`);
		}

		return newSeg;
	});
	return newSegments.flat(1);
};
