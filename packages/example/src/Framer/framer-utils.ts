import {random} from 'remotion';

export function selectColor(color: string, frame: number): number {
	return Math.floor((random(`${color}-${frame}`) * 255) % 255);
}
