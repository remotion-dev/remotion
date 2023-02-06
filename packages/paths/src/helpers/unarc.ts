import {iterateOverSegments} from './iterate';
import type {Instruction} from './parse';
import {parsePath} from './parse';

const TAU = Math.PI * 2;

function approximate_unit_arc(theta1: number, delta_theta: number) {
	const alpha = (4 / 3) * Math.tan(delta_theta / 4);

	const x1 = Math.cos(theta1);
	const y1 = Math.sin(theta1);
	const x2 = Math.cos(theta1 + delta_theta);
	const y2 = Math.sin(theta1 + delta_theta);

	return [
		x1,
		y1,
		x1 - y1 * alpha,
		y1 + x1 * alpha,
		x2 + y2 * alpha,
		y2 - x2 * alpha,
		x2,
		y2,
	];
}

function a2c({
	x1,
	y1,
	x2,
	y2,
	fa,
	fs,
	rx,
	ry,
	phi,
}: {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	fa: number;
	fs: number;
	rx: number;
	ry: number;
	phi: number;
}) {
	const sin_phi = Math.sin((phi * TAU) / 360);
	const cos_phi = Math.cos((phi * TAU) / 360);

	// Make sure radii are valid
	//
	const x1p = (cos_phi * (x1 - x2)) / 2 + (sin_phi * (y1 - y2)) / 2;
	const y1p = (-sin_phi * (x1 - x2)) / 2 + (cos_phi * (y1 - y2)) / 2;

	if (x1p === 0 && y1p === 0) {
		// we're asked to draw line to itself
		return [];
	}

	if (rx === 0 || ry === 0) {
		// one of the radii is zero
		return [];
	}

	// Compensate out-of-range radii
	//
	rx = Math.abs(rx);
	ry = Math.abs(ry);

	const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
	if (lambda > 1) {
		rx *= Math.sqrt(lambda);
		ry *= Math.sqrt(lambda);
	}

	// Get center parameters (cx, cy, theta1, delta_theta)
	//
	const cc = get_arc_center({x1, y1, x2, y2, fa, fs, rx, ry, sin_phi, cos_phi});

	const result = [];
	let theta1 = cc[2];
	let delta_theta = cc[3];

	// Split an arc to multiple segments, so each segment
	// will be less than τ/4 (= 90°)
	//
	const segments = Math.max(Math.ceil(Math.abs(delta_theta) / (TAU / 4)), 1);
	delta_theta /= segments;

	for (let i = 0; i < segments; i++) {
		result.push(approximate_unit_arc(theta1, delta_theta));
		theta1 += delta_theta;
	}

	// We have a bezier approximation of a unit circle,
	// now need to transform back to the original ellipse
	//
	return result.map((curve) => {
		for (let i = 0; i < curve.length; i += 2) {
			let x = curve[i + 0];
			let y = curve[i + 1];

			// scale
			x *= rx;
			y *= ry;

			// rotate
			const xp = cos_phi * x - sin_phi * y;
			const yp = sin_phi * x + cos_phi * y;

			// translate
			curve[i + 0] = xp + cc[0];
			curve[i + 1] = yp + cc[1];
		}

		return curve;
	});
}

// Requires path to be normalized
export const unarc = (d: string) => {
	const segments = parsePath(d);
	const x = 0;
	const y = 0;

	return iterateOverSegments({
		segments,
		iterate: ({segment}) => {
			if (segment[0] !== 'A') {
				return [segment];
			}

			const nextX = segment[6];
			const nextY = segment[7];
			const new_segments = a2c({
				x1: x,
				y1: y,
				x2: nextX,
				y2: nextY,
				fa: segment[4],
				fs: segment[5],
				rx: segment[1],
				ry: segment[2],
				phi: segment[3],
			});

			// Degenerated arcs can be ignored by renderer, but should not be dropped
			// to avoid collisions with `S A S` and so on. Replace with empty line.
			if (new_segments.length === 0) {
				return [['L', segment[6], segment[7]]];
			}

			const result = new_segments.map((_s) => {
				return ['C', _s[2], _s[3], _s[4], _s[5], _s[6], _s[7]] as Instruction;
			});
			return result;
		},
	});
};

function get_arc_center({
	x1,
	y1,
	x2,
	y2,
	fa,
	fs,
	rx,
	ry,
	sin_phi,
	cos_phi,
}: {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	fa: number;
	fs: number;
	rx: number;
	ry: number;
	sin_phi: number;
	cos_phi: number;
}) {
	// Step 1.
	//
	// Moving an ellipse so origin will be the middlepoint between our two
	// points. After that, rotate it to line up ellipse axes with coordinate
	// axes.
	//
	const x1p = (cos_phi * (x1 - x2)) / 2 + (sin_phi * (y1 - y2)) / 2;
	const y1p = (-sin_phi * (x1 - x2)) / 2 + (cos_phi * (y1 - y2)) / 2;

	const rx_sq = rx * rx;
	const ry_sq = ry * ry;
	const x1p_sq = x1p * x1p;
	const y1p_sq = y1p * y1p;

	// Step 2.
	//
	// Compute coordinates of the centre of this ellipse (cx', cy')
	// in the new coordinate system.
	//
	let radicant = rx_sq * ry_sq - rx_sq * y1p_sq - ry_sq * x1p_sq;

	if (radicant < 0) {
		// due to rounding errors it might be e.g. -1.3877787807814457e-17
		radicant = 0;
	}

	radicant /= rx_sq * y1p_sq + ry_sq * x1p_sq;
	radicant = Math.sqrt(radicant) * (fa === fs ? -1 : 1);

	const cxp = ((radicant * rx) / ry) * y1p;
	const cyp = ((radicant * -ry) / rx) * x1p;

	// Step 3.
	//
	// Transform back to get centre coordinates (cx, cy) in the original
	// coordinate system.
	//
	const cx = cos_phi * cxp - sin_phi * cyp + (x1 + x2) / 2;
	const cy = sin_phi * cxp + cos_phi * cyp + (y1 + y2) / 2;

	// Step 4.
	//
	// Compute angles (theta1, delta_theta).
	//
	const v1x = (x1p - cxp) / rx;
	const v1y = (y1p - cyp) / ry;
	const v2x = (-x1p - cxp) / rx;
	const v2y = (-y1p - cyp) / ry;

	const theta1 = unit_vector_angle(1, 0, v1x, v1y);
	let delta_theta = unit_vector_angle(v1x, v1y, v2x, v2y);

	if (fs === 0 && delta_theta > 0) {
		delta_theta -= TAU;
	}

	if (fs === 1 && delta_theta < 0) {
		delta_theta += TAU;
	}

	return [cx, cy, theta1, delta_theta];
}

function unit_vector_angle(ux: number, uy: number, vx: number, vy: number) {
	const sign = ux * vy - uy * vx < 0 ? -1 : 1;
	let dot = ux * vx + uy * vy;

	// Add this to work with arbitrary vectors:
	// dot /= Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);

	// rounding errors, e.g. -1.0000000000000002 can screw up this
	if (dot > 1.0) {
		dot = 1.0;
	}

	if (dot < -1.0) {
		dot = -1.0;
	}

	return sign * Math.acos(dot);
}
