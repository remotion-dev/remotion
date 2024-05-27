import {decasteljau} from './de-casteljau';

/**
 * Runs de Casteljau's algorithm enough times to produce the desired number of segments.
 *
 * @param {Number[][]} points Array of [x,y] points for de Casteljau (the initial segment to split)
 * @param {Number} segmentCount Number of segments to split the original into
 * @return {Number[][][]} Array of segments
 */
export function splitCurveAsPoints(
	points: number[][],
	segmentCount = 2,
): number[][][] {
	const segments = [];
	let remainingCurve = points;
	const tIncrement = 1 / segmentCount;

	// x-----x-----x-----x
	// t=  0.33   0.66   1
	// x-----o-----------x
	// r=  0.33
	//       x-----o-----x
	// r=         0.5  (0.33 / (1 - 0.33))  === tIncrement / (1 - (tIncrement * (i - 1))

	// x-----x-----x-----x----x
	// t=  0.25   0.5   0.75  1
	// x-----o----------------x
	// r=  0.25
	//       x-----o----------x
	// r=         0.33  (0.25 / (1 - 0.25))
	//             x-----o----x
	// r=         0.5  (0.25 / (1 - 0.5))

	for (let i = 0; i < segmentCount - 1; i++) {
		const tRelative = tIncrement / (1 - tIncrement * i);
		const split = decasteljau(remainingCurve, tRelative);
		segments.push(split.left);
		remainingCurve = split.right;
	}

	// last segment is just to the end from the last point
	segments.push(remainingCurve);

	return segments;
}
