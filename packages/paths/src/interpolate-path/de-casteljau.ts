/**
 * de Casteljau's algorithm for drawing and splitting bezier curves.
 * Inspired by https://pomax.github.io/bezierinfo/
 *
 * @param {Number[][]} points Array of [x,y] points: [start, control1, control2, ..., end]
 *   The original segment to split.
 * @param {Number} t Where to split the curve (value between [0, 1])
 * @return {Object} An object { left, right } where left is the segment from 0..t and
 *   right is the segment from t..1.
 */
export function decasteljau(
	points: number[][],
	t: number,
): {left: number[][]; right: number[][]} {
	const left: number[][] = [];
	const right: number[][] = [];

	function decasteljauRecurse(_points: number[][], _t: number) {
		if (_points.length === 1) {
			left.push(_points[0]);
			right.push(_points[0]);
		} else {
			const newPoints = Array(_points.length - 1);

			for (let i = 0; i < newPoints.length; i++) {
				if (i === 0) {
					left.push(_points[0]);
				}

				if (i === newPoints.length - 1) {
					right.push(_points[i + 1]);
				}

				newPoints[i] = [
					(1 - _t) * _points[i][0] + _t * _points[i + 1][0],
					(1 - _t) * _points[i][1] + _t * _points[i + 1][1],
				];
			}

			decasteljauRecurse(newPoints, _t);
		}
	}

	if (points.length) {
		decasteljauRecurse(points, t);
	}

	return {left, right: right.reverse()};
}
