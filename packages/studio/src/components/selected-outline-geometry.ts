export type OutlinePoint = {
	readonly x: number;
	readonly y: number;
};

export type SelectedOutline = {
	readonly key: string;
	readonly dimensions: {
		readonly width: number;
		readonly height: number;
	} | null;
	readonly points: readonly [
		OutlinePoint,
		OutlinePoint,
		OutlinePoint,
		OutlinePoint,
	];
};

export const clamp = (value: number, min: number, max: number): number => {
	return Math.min(max, Math.max(min, value));
};

export const mix = (from: number, to: number, progress: number): number => {
	return from + (to - from) * progress;
};

export const mixPoint = (
	from: OutlinePoint,
	to: OutlinePoint,
	progress: number,
): OutlinePoint => {
	return {
		x: mix(from.x, to.x, progress),
		y: mix(from.y, to.y, progress),
	};
};
