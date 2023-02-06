import type {AbsoluteInstruction, ReducesAbsoluteInstruction} from './types';

export const iterateOverSegments = <T extends ReducesAbsoluteInstruction>({
	segments,
	iterate,
}: {
	segments: AbsoluteInstruction[];
	iterate: (options: {
		segment: AbsoluteInstruction;
		prevSegment: AbsoluteInstruction | null;
		x: number;
		y: number;
	}) => T[];
}): T[] => {
	let x = 0;
	let y = 0;

	const newSegments = segments.map((s, i) => {
		const newSeg = iterate({
			segment: s,
			x,
			y,
			prevSegment: segments[i - 1] ?? null,
		});
		switch (s.type) {
			case 'M':
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
