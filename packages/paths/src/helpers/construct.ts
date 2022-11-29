// Copied from: https://github.com/rveciana/svg-path-properties

import {makeArc} from './arc';
import {makeBezier} from './bezier';
import {makeLinearPosition} from './linear';
import type {Instruction} from './parse';
import {parsePath} from './parse';
import type {Point, PointArray, Properties} from './types';

export const construct = (string: string) => {
	let length = 0;
	const partial_lengths: number[] = [];
	const functions: (null | Properties)[] = [];
	let initial_point: null | Point = null;
	const parsed = parsePath(string);
	let cur: PointArray = [0, 0];
	let prev_point: PointArray = [0, 0];
	let curve: ReturnType<typeof makeBezier> | undefined;
	let ringStart: PointArray = [0, 0];

	const segments: Instruction[][] = [];

	for (let i = 0; i < parsed.length; i++) {
		const instruction = parsed[i];

		if (instruction[0].toLowerCase() !== 'm' && segments.length > 0) {
			segments[segments.length - 1].push(instruction);
		}

		// moveTo
		if (instruction[0] === 'M') {
			cur = [instruction[1], instruction[2]];
			ringStart = [cur[0], cur[1]];
			segments.push([instruction]);
			functions.push(null);
			if (i === 0) {
				initial_point = {x: instruction[1], y: instruction[2]};
			}
		} else if (instruction[0] === 'm') {
			cur = [instruction[1] + cur[0], instruction[2] + cur[1]];
			ringStart = [cur[0], cur[1]];
			segments.push([['M', cur[0], cur[1]]]);
			functions.push(null);
			// lineTo
		} else if (instruction[0] === 'L') {
			length += Math.sqrt(
				(cur[0] - instruction[1]) ** 2 + (cur[1] - instruction[2]) ** 2
			);
			functions.push(
				makeLinearPosition(cur[0], instruction[1], cur[1], instruction[2])
			);
			cur = [instruction[1], instruction[2]];
		} else if (instruction[0] === 'l') {
			length += Math.sqrt(instruction[1] ** 2 + instruction[2] ** 2);
			functions.push(
				makeLinearPosition(
					cur[0],
					instruction[1] + cur[0],
					cur[1],
					instruction[2] + cur[1]
				)
			);
			cur = [instruction[1] + cur[0], instruction[2] + cur[1]];
		} else if (instruction[0] === 'H') {
			length += Math.abs(cur[0] - instruction[1]);
			functions.push(
				makeLinearPosition(cur[0], instruction[1], cur[1], cur[1])
			);
			cur[0] = instruction[1];
		} else if (instruction[0] === 'h') {
			length += Math.abs(instruction[1]);
			functions.push(
				makeLinearPosition(cur[0], cur[0] + instruction[1], cur[1], cur[1])
			);
			cur[0] = instruction[1] + cur[0];
		} else if (instruction[0] === 'V') {
			length += Math.abs(cur[1] - instruction[1]);
			functions.push(
				makeLinearPosition(cur[0], cur[0], cur[1], instruction[1])
			);
			cur[1] = instruction[1];
		} else if (instruction[0] === 'v') {
			length += Math.abs(instruction[1]);
			functions.push(
				makeLinearPosition(cur[0], cur[0], cur[1], cur[1] + instruction[1])
			);
			cur[1] = instruction[1] + cur[1];
			// Close path
		} else if (instruction[0] === 'z' || instruction[0] === 'Z') {
			length += Math.sqrt(
				(ringStart[0] - cur[0]) ** 2 + (ringStart[1] - cur[1]) ** 2
			);
			functions.push(
				makeLinearPosition(cur[0], ringStart[0], cur[1], ringStart[1])
			);
			cur = [ringStart[0], ringStart[1]];
			// Cubic Bezier curves
		} else if (instruction[0] === 'C') {
			curve = makeBezier({
				ax: cur[0],
				ay: cur[1],
				bx: instruction[1],
				by: instruction[2],
				cx: instruction[3],
				cy: instruction[4],
				dx: instruction[5],
				dy: instruction[6],
			});
			length += curve.getTotalLength();
			cur = [instruction[5], instruction[6]];
			functions.push(curve);
		} else if (instruction[0] === 'c') {
			curve = makeBezier({
				ax: cur[0],
				ay: cur[1],
				bx: cur[0] + instruction[1],
				by: cur[1] + instruction[2],
				cx: cur[0] + instruction[3],
				cy: cur[1] + instruction[4],
				dx: cur[0] + instruction[5],
				dy: cur[1] + instruction[6],
			});
			if (curve.getTotalLength() > 0) {
				length += curve.getTotalLength();
				functions.push(curve);
				cur = [instruction[5] + cur[0], instruction[6] + cur[1]];
			} else {
				functions.push(makeLinearPosition(cur[0], cur[0], cur[1], cur[1]));
			}
		} else if (instruction[0] === 'S') {
			if (i > 0 && ['C', 'c', 'S', 's'].indexOf(parsed[i - 1][0]) > -1) {
				if (curve) {
					const c = curve.getC();
					curve = makeBezier({
						ax: cur[0],
						ay: cur[1],
						bx: 2 * cur[0] - c.x,
						by: 2 * cur[1] - c.y,
						cx: instruction[1],
						cy: instruction[2],
						dx: instruction[3],
						dy: instruction[4],
					});
				}
			} else {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: cur[0],
					by: cur[1],
					cx: instruction[1],
					cy: instruction[2],
					dx: instruction[3],
					dy: instruction[4],
				});
			}

			if (curve) {
				length += curve.getTotalLength();
				cur = [instruction[3], instruction[4]];
				functions.push(curve);
			}
		} else if (instruction[0] === 's') {
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
						cx: cur[0] + instruction[1],
						cy: cur[1] + instruction[2],
						dx: cur[0] + instruction[3],
						dy: cur[1] + instruction[4],
					});
				}
			} else {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: cur[0],
					by: cur[1],
					cx: cur[0] + instruction[1],
					cy: cur[1] + instruction[2],
					dx: cur[0] + instruction[3],
					dy: cur[1] + instruction[4],
				});
			}

			if (curve) {
				length += curve.getTotalLength();
				cur = [instruction[3] + cur[0], instruction[4] + cur[1]];
				functions.push(curve);
			}
		}
		// Quadratic Bezier curves
		else if (instruction[0] === 'Q') {
			if (cur[0] === instruction[1] && cur[1] === instruction[2]) {
				const linearCurve = makeLinearPosition(
					instruction[1],
					instruction[3],
					instruction[2],
					instruction[4]
				);
				length += linearCurve.getTotalLength();
				functions.push(linearCurve);
			} else {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: instruction[1],
					by: instruction[2],
					cx: instruction[3],
					cy: instruction[4],
					dx: null,
					dy: null,
				});
				length += curve.getTotalLength();
				functions.push(curve);
			}

			cur = [instruction[3], instruction[4]];
			prev_point = [instruction[1], instruction[2]];
		} else if (instruction[0] === 'q') {
			if (instruction[1] === 0 && instruction[2] === 0) {
				const linearCurve = makeLinearPosition(
					cur[0] + instruction[1],
					cur[0] + instruction[3],
					cur[1] + instruction[2],
					cur[1] + instruction[4]
				);
				length += linearCurve.getTotalLength();
				functions.push(linearCurve);
			} else {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: cur[0] + instruction[1],
					by: cur[1] + instruction[2],
					cx: cur[0] + instruction[3],
					cy: cur[1] + instruction[4],
					dx: null,
					dy: null,
				});
				length += curve.getTotalLength();
				functions.push(curve);
			}

			prev_point = [cur[0] + instruction[1], cur[1] + instruction[2]];
			cur = [instruction[3] + cur[0], instruction[4] + cur[1]];
		} else if (instruction[0] === 'T') {
			if (i > 0 && ['Q', 'q', 'T', 't'].indexOf(parsed[i - 1][0]) > -1) {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: 2 * cur[0] - prev_point[0],
					by: 2 * cur[1] - prev_point[1],
					cx: instruction[1],
					cy: instruction[2],
					dx: null,
					dy: null,
				});
				functions.push(curve);
				length += curve.getTotalLength();
			} else {
				const linearCurve = makeLinearPosition(
					cur[0],
					instruction[1],
					cur[1],
					instruction[2]
				);
				functions.push(linearCurve);
				length += linearCurve.getTotalLength();
			}

			prev_point = [2 * cur[0] - prev_point[0], 2 * cur[1] - prev_point[1]];
			cur = [instruction[1], instruction[2]];
		} else if (instruction[0] === 't') {
			if (i > 0 && ['Q', 'q', 'T', 't'].indexOf(parsed[i - 1][0]) > -1) {
				curve = makeBezier({
					ax: cur[0],
					ay: cur[1],
					bx: 2 * cur[0] - prev_point[0],
					by: 2 * cur[1] - prev_point[1],
					cx: cur[0] + instruction[1],
					cy: cur[1] + instruction[2],
					dx: null,
					dy: null,
				});
				length += curve.getTotalLength();
				functions.push(curve);
			} else {
				const linearCurve = makeLinearPosition(
					cur[0],
					cur[0] + instruction[1],
					cur[1],
					cur[1] + instruction[2]
				);
				length += linearCurve.getTotalLength();
				functions.push(linearCurve);
			}

			prev_point = [2 * cur[0] - prev_point[0], 2 * cur[1] - prev_point[1]];
			cur = [instruction[1] + cur[0], instruction[2] + cur[1]];
		} else if (instruction[0] === 'A') {
			const arcCurve = makeArc({
				x0: cur[0],
				y0: cur[1],
				rx: instruction[1],
				ry: instruction[2],
				xAxisRotate: instruction[3],
				LargeArcFlag: instruction[4] === 1,
				SweepFlag: instruction[5] === 1,
				x1: instruction[6],
				y1: instruction[7],
			});

			length += arcCurve.getTotalLength();
			cur = [instruction[6], instruction[7]];
			functions.push(arcCurve);
		} else if (instruction[0] === 'a') {
			const arcCurve = makeArc({
				x0: cur[0],
				y0: cur[1],
				rx: instruction[1],
				ry: instruction[2],
				xAxisRotate: instruction[3],
				LargeArcFlag: instruction[4] === 1,
				SweepFlag: instruction[5] === 1,
				x1: cur[0] + instruction[6],
				y1: cur[1] + instruction[7],
			});

			length += arcCurve.getTotalLength();
			cur = [cur[0] + instruction[6], cur[1] + instruction[7]];
			functions.push(arcCurve);
		}

		partial_lengths.push(length);
	}

	return {
		segments,
		initial_point,
		length,
		partial_lengths,
		functions,
	};
};
