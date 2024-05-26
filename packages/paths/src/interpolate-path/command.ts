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
