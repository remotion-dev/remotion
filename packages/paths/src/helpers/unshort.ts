import type {Instruction} from './parse';

// Requires that the path is already normalized
export const unshort = function (segments: Instruction[]): Instruction[] {
	let prevControlX = 0;
	let prevControlY = 0;
	let curControlX = 0;
	let curControlY = 0;

	let x = 0;
	let y = 0;

	const newSegments = segments.slice(0);

	for (let i = 0; i < newSegments.length; i++) {
		const s = newSegments[i];
		const name = s[0];
		switch (s[0]) {
			case 'M':
			case 'L': {
				x = s[1];
				y = s[2];
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

			case 'Z':
				break;

			default:
				throw new Error('Unexpected command: ' + s[0]);
		}

		const nameUC = name.toUpperCase();
		let isRelative;

		// First command MUST be M|m, it's safe to skip.
		// Protect from access to [-1] for sure.
		if (!i) {
			continue;
		}

		if (nameUC === 'T') {
			// quadratic curve
			isRelative = name === 't';

			const prevSegment = newSegments[i - 1];

			if (prevSegment[0] === 'Q') {
				prevControlX = prevSegment[1] - x;
				prevControlY = prevSegment[2] - y;
			} else if (prevSegment[0] === 'q') {
				prevControlX = prevSegment[1] - prevSegment[3];
				prevControlY = prevSegment[2] - prevSegment[4];
			} else {
				prevControlX = 0;
				prevControlY = 0;
			}

			curControlX = -prevControlX;
			curControlY = -prevControlY;

			if (!isRelative) {
				curControlX += x;
				curControlY += y;
			}

			newSegments[i] = [
				isRelative ? 'q' : 'Q',
				curControlX,
				curControlY,
				s[1],
				s[2],
			];
		} else if (nameUC === 'S') {
			// cubic curve
			isRelative = name === 's';

			const prevSegment = newSegments[i - 1];

			if (prevSegment[0] === 'C') {
				prevControlX = prevSegment[3] - x;
				prevControlY = prevSegment[4] - y;
			} else if (prevSegment[0] === 'c') {
				prevControlX = prevSegment[3] - prevSegment[5];
				prevControlY = prevSegment[4] - prevSegment[6];
			} else {
				prevControlX = 0;
				prevControlY = 0;
			}

			curControlX = -prevControlX;
			curControlY = -prevControlY;

			if (!isRelative) {
				curControlX += x;
				curControlY += y;
			}

			newSegments[i] = [
				isRelative ? 'c' : 'C',
				curControlX,
				curControlY,
				s[1],
				s[2],
				s[3],
				s[4],
			];
		}
	}

	return newSegments;
};
