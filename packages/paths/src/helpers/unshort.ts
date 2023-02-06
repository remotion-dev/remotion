import type {Instruction} from './types';

// Requires that the path is already normalized
export const unshort = function (segments: Instruction[]): Instruction[] {
	let prevControlX = 0;
	let prevControlY = 0;
	let curControlX = 0;
	let curControlY = 0;

	const newSegments = segments.slice(0);

	for (let i = 0; i < newSegments.length; i++) {
		const s = newSegments[i];

		// First command MUST be M|m, it's safe to skip.
		// Protect from access to [-1] for sure.
		if (!i) {
			continue;
		}

		if (s.type === 'T') {
			// quadratic curve

			const prevSegment = newSegments[i - 1];

			if (prevSegment.type === 'Q') {
				prevControlX = prevSegment.cpx;
				prevControlY = prevSegment.cpy;
			} else {
				prevControlX = 0;
				prevControlY = 0;
			}

			curControlX = -prevControlX;
			curControlY = -prevControlY;

			newSegments[i] = {
				type: 'Q',
				cpx: curControlX,
				cpy: curControlY,
				x: s.x,
				y: s.y,
			};
		} else if (s.type === 'S') {
			// cubic curve

			const prevSegment = newSegments[i - 1];

			if (prevSegment.type === 'C') {
				prevControlX = prevSegment.cp2x;
				prevControlY = prevSegment.cp2y;
			} else {
				prevControlX = 0;
				prevControlY = 0;
			}

			curControlX = -prevControlX;
			curControlY = -prevControlY;

			newSegments[i] = {
				type: 'C',
				cp1x: curControlX,
				cp1y: curControlY,
				cp2x: s.cpx,
				cp2y: s.cpy,
				x: s.x,
				y: s.y,
			};
		}
	}

	return newSegments;
};
