import type {CanvasOutlinePoint as OutlinePoint} from '@remotion/canvas/internal';

export type {
	CanvasOutline as SelectedOutline,
	CanvasOutlinePoint as OutlinePoint,
} from '@remotion/canvas/internal';

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
