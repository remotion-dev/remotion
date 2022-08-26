import {Arc} from './arc';
import {Bezier} from './bezier';
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
	let curve: Bezier | undefined;
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
			curve = new Bezier(
				cur[0],
				cur[1],
				parsed[i][1],
				parsed[i][2],
				parsed[i][3],
				parsed[i][4],
				parsed[i][5],
				parsed[i][6]
			);
			length += curve.getTotalLength();
			cur = [parsed[i][5], parsed[i][6]];
			functions.push(curve);
		} else if (parsed[i][0] === 'c') {
			curve = new Bezier(
				cur[0],
				cur[1],
				cur[0] + parsed[i][1],
				cur[1] + parsed[i][2],
				cur[0] + parsed[i][3],
				cur[1] + parsed[i][4],
				cur[0] + parsed[i][5],
				cur[1] + parsed[i][6]
			);
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
					curve = new Bezier(
						cur[0],
						cur[1],
						2 * cur[0] - c.x,
						2 * cur[1] - c.y,
						parsed[i][1],
						parsed[i][2],
						parsed[i][3],
						parsed[i][4]
					);
				}
			} else {
				curve = new Bezier(
					cur[0],
					cur[1],
					cur[0],
					cur[1],
					parsed[i][1],
					parsed[i][2],
					parsed[i][3],
					parsed[i][4]
				);
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
					curve = new Bezier(
						cur[0],
						cur[1],
						cur[0] + d.x - c.x,
						cur[1] + d.y - c.y,
						cur[0] + parsed[i][1],
						cur[1] + parsed[i][2],
						cur[0] + parsed[i][3],
						cur[1] + parsed[i][4]
					);
				}
			} else {
				curve = new Bezier(
					cur[0],
					cur[1],
					cur[0],
					cur[1],
					cur[0] + parsed[i][1],
					cur[1] + parsed[i][2],
					cur[0] + parsed[i][3],
					cur[1] + parsed[i][4]
				);
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
				curve = new Bezier(
					cur[0],
					cur[1],
					parsed[i][1],
					parsed[i][2],
					parsed[i][3],
					parsed[i][4],
					undefined,
					undefined
				);
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
				curve = new Bezier(
					cur[0],
					cur[1],
					cur[0] + parsed[i][1],
					cur[1] + parsed[i][2],
					cur[0] + parsed[i][3],
					cur[1] + parsed[i][4],
					undefined,
					undefined
				);
				length += curve.getTotalLength();
				functions.push(curve);
			}

			prev_point = [cur[0] + parsed[i][1], cur[1] + parsed[i][2]];
			cur = [parsed[i][3] + cur[0], parsed[i][4] + cur[1]];
		} else if (parsed[i][0] === 'T') {
			if (i > 0 && ['Q', 'q', 'T', 't'].indexOf(parsed[i - 1][0]) > -1) {
				curve = new Bezier(
					cur[0],
					cur[1],
					2 * cur[0] - prev_point[0],
					2 * cur[1] - prev_point[1],
					parsed[i][1],
					parsed[i][2],
					undefined,
					undefined
				);
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
				curve = new Bezier(
					cur[0],
					cur[1],
					2 * cur[0] - prev_point[0],
					2 * cur[1] - prev_point[1],
					cur[0] + parsed[i][1],
					cur[1] + parsed[i][2],
					undefined,
					undefined
				);
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
			const arcCurve = new Arc(
				cur[0],
				cur[1],
				parsed[i][1],
				parsed[i][2],
				parsed[i][3],
				parsed[i][4] === 1,
				parsed[i][5] === 1,
				parsed[i][6],
				parsed[i][7]
			);

			length += arcCurve.getTotalLength();
			cur = [parsed[i][6], parsed[i][7]];
			functions.push(arcCurve);
		} else if (parsed[i][0] === 'a') {
			const arcCurve = new Arc(
				cur[0],
				cur[1],
				parsed[i][1],
				parsed[i][2],
				parsed[i][3],
				parsed[i][4] === 1,
				parsed[i][5] === 1,
				cur[0] + parsed[i][6],
				cur[1] + parsed[i][7]
			);

			length += arcCurve.getTotalLength();
			cur = [cur[0] + parsed[i][6], cur[1] + parsed[i][7]];
			functions.push(arcCurve);
		}

		partial_lengths.push(length);
	}

	return {initial_point, length, partial_lengths, functions};
};
