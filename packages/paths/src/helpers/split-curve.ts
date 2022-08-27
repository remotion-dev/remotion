/*

Copied and adapted from https://github.com/pbeshai/d3-interpolate-path:
Copyright 2016, Peter Beshai
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the author nor the names of contributors may be used to
  endorse or promote products derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

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
function decasteljau(
	points: number[][],
	t: number
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

/**
 * List of params for each command type in a path `d` attribute
 */
export const typeMap = {
	M: ['x', 'y'],
	L: ['x', 'y'],
	H: ['x'],
	V: ['y'],
	C: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
	S: ['x2', 'y2', 'x', 'y'],
	Q: ['x1', 'y1', 'x', 'y'],
	T: ['x', 'y'],
	A: ['rx', 'ry', 'xAxisRotation', 'largeArcFlag', 'sweepFlag', 'x', 'y'],
	Z: [],
	m: ['x', 'y'],
	l: ['x', 'y'],
	h: ['x'],
	v: ['y'],
	c: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
	s: ['x2', 'y2', 'x', 'y'],
	q: ['x1', 'y1', 'x', 'y'],
	t: ['x', 'y'],
	a: ['rx', 'ry', 'xAxisRotation', 'largeArcFlag', 'sweepFlag', 'x', 'y'],
	z: [],
};

export type Command = {
	x2?: number | undefined;
	y2?: number | undefined;
	x1?: number | undefined;
	y1?: number | undefined;
	x?: number;
	y?: number;
	xAxisRotate?: number;
	largeArcFlag?: boolean;
	sweepFlag?: boolean;
	type: keyof typeof typeMap;
};

/**
 * Convert segments represented as points back into a command object
 *
 * @param {Number[][]} points Array of [x,y] points: [start, control1, control2, ..., end]
 *   Represents a segment
 * @return {Object} A command object representing the segment.
 */
function pointsToCommand(points: number[][]): Command {
	let x2: number | undefined;
	let y2: number | undefined;
	let x1: number | undefined;
	let y1: number | undefined;

	if (points.length === 4) {
		x2 = points[2][0];
		y2 = points[2][1];
	}

	if (points.length >= 3) {
		x1 = points[1][0];
		y1 = points[1][1];
	}

	const x = points[points.length - 1][0];
	const y = points[points.length - 1][1];

	let type: 'C' | 'Q' | 'L' = 'L';

	if (points.length === 4) {
		// start, control1, control2, end
		type = 'C';
	} else if (points.length === 3) {
		// start, control, end
		type = 'Q';
	}

	return {x2, y2, x1, y1, x, y, type};
}

/**
 * Runs de Casteljau's algorithm enough times to produce the desired number of segments.
 *
 * @param {Number[][]} points Array of [x,y] points for de Casteljau (the initial segment to split)
 * @param {Number} segmentCount Number of segments to split the original into
 * @return {Number[][][]} Array of segments
 */
function splitCurveAsPoints(
	points: number[][],
	segmentCount: number
): number[][][] {
	segmentCount = segmentCount || 2;

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

/**
 * Convert command objects to arrays of points, run de Casteljau's algorithm on it
 * to split into to the desired number of segments.
 *
 * @param {Object} commandStart The start command object
 * @param {Object} commandEnd The end command object
 * @param {Number} segmentCount The number of segments to create
 * @return {Object[]} An array of commands representing the segments in sequence
 */
export const splitCurve = (
	commandStart: Command,
	commandEnd: Command,
	segmentCount: number
): Command[] => {
	const points = [[commandStart.x, commandStart.y]] as number[][];
	if (commandEnd.x1 !== null && commandEnd.x1 !== undefined) {
		points.push([commandEnd.x1, commandEnd.y1 as number]);
	}

	if (commandEnd.x2 !== null && commandEnd.x2 !== undefined) {
		points.push([commandEnd.x2, commandEnd.y2 as number]);
	}

	points.push([commandEnd.x as number, commandEnd.y as number]);

	return splitCurveAsPoints(points, segmentCount).map(pointsToCommand);
};
