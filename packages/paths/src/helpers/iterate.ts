import type {Instruction} from './parse';

export const iterateOverSegments = ({
	segments,
	iterate,
}: {
	segments: Instruction[];
	iterate: (options: {
		segment: Instruction;
		x: number;
		y: number;
	}) => Instruction[];
}): Instruction[] => {
	let x = 0;
	let y = 0;

	const newSegments = segments.map((s) => {
		const newSeg = iterate({segment: s, x, y});
		switch (s[0]) {
			case 'M':
			case 'L': {
				x = s[1];
				y = s[2];
				break;
			}

			case 'A': {
				x = s[6];
				y = s[7];
				break;
			}

			case 'V': {
				y = s[1];
				break;
			}

			case 'H': {
				x = s[1];
				break;
			}

			case 'C': {
				x = s[5];
				y = s[6];
				break;
			}

			case 'Q': {
				x = s[3];
				y = s[4];
				break;
			}

			case 'Z': {
				break;
			}

			default:
				throw new Error(`Unexpected instruction ${s[0]}`);
		}

		return newSeg;
	});
	return newSegments.flat(1);
};
