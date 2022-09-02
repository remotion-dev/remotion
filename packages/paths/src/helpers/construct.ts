// Copied from: https://github.com/rveciana/svg-path-properties

import {makeArc} from './arc';
import {makeBezier} from './bezier';
import {makeLinearPosition} from './linear';
import parse from './parse';
import type {Point, PointArray, Properties} from './types';

export const construct = (string: string) => {
	let length = 0;
	const partial_lengths: number[] = [];
	const functions: (null | Properties)[] = [];
	let initial_point: null | Point = null;
	const parsed = parse(string);
	let cur: PointArray = [0, 0];
	let prev_point: PointArray = [0, 0];
	let curve: ReturnType<typeof makeBezier> | undefined;
	let ringStart: PointArray = [0, 0];
	for (let i = 0; i < parsed.length; i++) {
		// moveTo
		if (parsed[i][0] === 'M') {
			cur = [parsed[i][1], parsed[i][2]];
			ringStart = [cur[0], cur[1]];
			functions.push(null);
			if (i === 0) {
				initial_point = {x: parsed[i][1], y: parsed[i][2]};
			}
		} else if (parsed[i][0] === 'm') {
			cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[1]];
			ringStart = [cur[0], cur[1]];
			functions.push(null);
			// lineTo
		} else if (parsed[i][0] === 'L') {
			length += Math.sqrt(
				(cur[0] - parsed[i][1]) ** 2 + (cur[1] - parsed[i][2]) ** 2
			);
			functions.push(
				makeLinearPosition(cur[0], parsed[i][1], cur[1], parsed[i][2])
			);
			cur = [parsed[i][1], parsed[i][2]];
		} else if (parsed[i][0] === 'l') {
			length += Math.sqrt(parsed[i][1] ** 2 + parsed[i][2] ** 2);
			functions.push(
				makeLinearPosition(
					cur[0],
					parsed[i][1] + cur[0],
					cur[1],
					parsed[i][2] + cur[1]
				)
			);
			cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[1]];
		} else if (parsed[i][0] === 'H') {
			length += Math.abs(cur[0] - parsed[i][1]);
			functions.push(makeLinearPosition(cur[0], parsed[i][1], cur[1], cur[1]));
			cur[0] = parsed[i][1];
		} else if (parsed[i][0] === 'h') {
			length += Math.abs(parsed[i][1]);
			functions.push(
				makeLinearPosition(cur[0], cur[0] + parsed[i][1], cur[1], cur[1])
			);
			cur[0] = parsed[i][1] + cur[0];
		} else if (parsed[i][0] === 'V') {
			length += Math.abs(cur[1] - parsed[i][1]);
			functions.push(makeLinearPosition(cur[0], cur[0], cur[1], parsed[i][1]));
			cur[1] = parsed[i][1];
		} else if (parsed[i][0] === 'v') {
			length += Math.abs(parsed[i][1]);
			functions.push(
				makeLinearPosition(cur[0], cur[0], cur[1], cur[1] + parsed[i][1])
			);
			cur[1] = parsed[i][1] + cur[1];
			// Close path
		} else if (parsed[i][0] === 'z' || parsed[i][0] === 'Z') {
			length += Math.sqrt(
				(ringStart[0] - cur[0]) ** 2 + (ringStart[1] - cur[1]) ** 2
			);
			functions.push(
				makeLinearPosition(cur[0], ringStart[0], cur[1], ringStart[1])
			);
			cur = [ringStart[0], ringStart[1]];
			// Cubic Bezier curves
		} else if (parsed[i][0] === 'C') {
			curve = makeBezier({
				ax: cur[0],
				ay: cur[1],
				bx: parsed[i][1],
				by: parsed[i][2],
				cx: parsed[i][3],
				cy: parsed[i][4],
				dx: parsed[i][5],
				dy: parsed[i][6],
			});
			length += curve.getTotalLength();
			cur = [parsed[i][5], parsed[i][6]];
			functions.push(curve);
		} else if (parsed[i][0] === 'c') {
			curve = makeBezier({
				ax: cur[0],
				ay: cur[1],
				bx: cur[0] + parsed[i][1],
				by: cur[1] + parsed[i][2],
				cx: cur[0] + parsed[i][3],
				cy: cur[1] + parsed[i][4],
				dx: cur[0] + parsed[i][5],
				dy: cur[1] + parsed[i][6],
			});
			if (curve.getTotalLength() > 0) {
				length += curve.getTotalLength();
				functions.push(curve);
				cur = [parsed[i][5] + cur[0], parsed[i][6] + cur[1]];
			} else {
				functions.push(makeLinearPosition(cur[0], cur[0], cur[1], cur[1]));
			}
		} else if (parsed[i][0] === 'S') {
			if (i > 0 && ['C', 'c', 'S', 's'].indexOf(parsed[i - 1][0]) > -1) {
				if (curve) {
					const c = curve.getC();
					curve = makeBezier({
						ax: cur[0],
						ay: cur[1],
						bx: 2 * cur[0] - c.x,
						by: 2 * cur[1] - c.y,
						cx: parsed[i][1],
						cy: parsed[i][2],
						dx: parsed[i][3],
						dy: parsed[i][4],
					});
				}
			} else {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: cur[0],
					by: cur[1],
					cx: parsed[i][1],
					cy: parsed[i][2],
					dx: parsed[i][3],
					dy: parsed[i][4],
				});
			}

			if (curve) {
				length += curve.getTotalLength();
				cur = [parsed[i][3], parsed[i][4]];
				functions.push(curve);
			}
		} else if (parsed[i][0] === 's') {
			// 240 225
			if (i > 0 && ['C', 'c', 'S', 's'].indexOf(parsed[i - 1][0]) > -1) {
				if (curve) {
					const c = curve.getC();
					const d = curve.getD();
					curve = makeBezier({
						ax: cur[0],
						ay: cur[1],
						bx: cur[0] + d.x - c.x,
						by: cur[1] + d.y - c.y,
						cx: cur[0] + parsed[i][1],
						cy: cur[1] + parsed[i][2],
						dx: cur[0] + parsed[i][3],
						dy: cur[1] + parsed[i][4],
					});
				}
			} else {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: cur[0],
					by: cur[1],
					cx: cur[0] + parsed[i][1],
					cy: cur[1] + parsed[i][2],
					dx: cur[0] + parsed[i][3],
					dy: cur[1] + parsed[i][4],
				});
			}

			if (curve) {
				length += curve.getTotalLength();
				cur = [parsed[i][3] + cur[0], parsed[i][4] + cur[1]];
				functions.push(curve);
			}
		}
		// Quadratic Bezier curves
		else if (parsed[i][0] === 'Q') {
			if (cur[0] === parsed[i][1] && cur[1] === parsed[i][2]) {
				const linearCurve = makeLinearPosition(
					parsed[i][1],
					parsed[i][3],
					parsed[i][2],
					parsed[i][4]
				);
				length += linearCurve.getTotalLength();
				functions.push(linearCurve);
			} else {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: parsed[i][1],
					by: parsed[i][2],
					cx: parsed[i][3],
					cy: parsed[i][4],
					dx: null,
					dy: null,
				});
				length += curve.getTotalLength();
				functions.push(curve);
			}

			cur = [parsed[i][3], parsed[i][4]];
			prev_point = [parsed[i][1], parsed[i][2]];
		} else if (parsed[i][0] === 'q') {
			if (parsed[i][1] === 0 && parsed[i][2] === 0) {
				const linearCurve = makeLinearPosition(
					cur[0] + parsed[i][1],
					cur[0] + parsed[i][3],
					cur[1] + parsed[i][2],
					cur[1] + parsed[i][4]
				);
				length += linearCurve.getTotalLength();
				functions.push(linearCurve);
			} else {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: cur[0] + parsed[i][1],
					by: cur[1] + parsed[i][2],
					cx: cur[0] + parsed[i][3],
					cy: cur[1] + parsed[i][4],
					dx: null,
					dy: null,
				});
				length += curve.getTotalLength();
				functions.push(curve);
			}

			prev_point = [cur[0] + parsed[i][1], cur[1] + parsed[i][2]];
			cur = [parsed[i][3] + cur[0], parsed[i][4] + cur[1]];
		} else if (parsed[i][0] === 'T') {
			if (i > 0 && ['Q', 'q', 'T', 't'].indexOf(parsed[i - 1][0]) > -1) {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: 2 * cur[0] - prev_point[0],
					by: 2 * cur[1] - prev_point[1],
					cx: parsed[i][1],
					cy: parsed[i][2],
					dx: null,
					dy: null,
				});
				functions.push(curve);
				length += curve.getTotalLength();
			} else {
				const linearCurve = makeLinearPosition(
					cur[0],
					parsed[i][1],
					cur[1],
					parsed[i][2]
				);
				functions.push(linearCurve);
				length += linearCurve.getTotalLength();
			}

			prev_point = [2 * cur[0] - prev_point[0], 2 * cur[1] - prev_point[1]];
			cur = [parsed[i][1], parsed[i][2]];
		} else if (parsed[i][0] === 't') {
			if (i > 0 && ['Q', 'q', 'T', 't'].indexOf(parsed[i - 1][0]) > -1) {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: 2 * cur[0] - prev_point[0],
					by: 2 * cur[1] - prev_point[1],
					cx: cur[0] + parsed[i][1],
					cy: cur[1] + parsed[i][2],
					dx: null,
					dy: null,
				});
				length += curve.getTotalLength();
				functions.push(curve);
			} else {
				const linearCurve = makeLinearPosition(
					cur[0],
					cur[0] + parsed[i][1],
					cur[1],
					cur[1] + parsed[i][2]
				);
				length += linearCurve.getTotalLength();
				functions.push(linearCurve);
			}

			prev_point = [2 * cur[0] - prev_point[0], 2 * cur[1] - prev_point[1]];
			cur = [parsed[i][1] + cur[0], parsed[i][2] + cur[1]];
		} else if (parsed[i][0] === 'A') {
			const arcCurve = makeArc({
				x0: cur[0],
				y0: cur[1],
				rx: parsed[i][1],
				ry: parsed[i][2],
				xAxisRotate: parsed[i][3],
				LargeArcFlag: parsed[i][4] === 1,
				SweepFlag: parsed[i][5] === 1,
				x1: parsed[i][6],
				y1: parsed[i][7],
			});

			length += arcCurve.getTotalLength();
			cur = [parsed[i][6], parsed[i][7]];
			functions.push(arcCurve);
		} else if (parsed[i][0] === 'a') {
			const arcCurve = makeArc({
				x0: cur[0],
				y0: cur[1],
				rx: parsed[i][1],
				ry: parsed[i][2],
				xAxisRotate: parsed[i][3],
				LargeArcFlag: parsed[i][4] === 1,
				SweepFlag: parsed[i][5] === 1,
				x1: cur[0] + parsed[i][6],
				y1: cur[1] + parsed[i][7],
			});

			length += arcCurve.getTotalLength();
			cur = [cur[0] + parsed[i][6], cur[1] + parsed[i][7]];
			functions.push(arcCurve);
		}

		partial_lengths.push(length);
	}

	return {initial_point, length, partial_lengths, functions};
};
