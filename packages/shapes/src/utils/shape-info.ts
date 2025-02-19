import type {Instruction} from '@remotion/paths';

export type ShapeInfo = {
	path: string;
	width: number;
	height: number;
	transformOrigin: string;
	instructions: Instruction[];
};
