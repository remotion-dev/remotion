// Copied from: https://github.com/rveciana/svg-path-properties

export interface Properties {
	getTotalLength(): number;
	getPointAtLength(pos: number): Point;
	getTangentAtLength(pos: number): Point;
}

export interface Part {
	start: Point;
	end: Point;
	length: number;
	getPointAtLength(pos: number): Point;
	getTangentAtLength(pos: number): Point;
}
export interface Point {
	x: number;
	y: number;
}
export type PointArray = [number, number];

export interface PointProperties {
	tangentX: number;
	tangentY: number;
}

export type pathOrders =
	| 'a'
	| 'c'
	| 'h'
	| 'l'
	| 'm'
	| 'q'
	| 's'
	| 't'
	| 'v'
	| 'z';
