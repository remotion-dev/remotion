import type {Instruction} from './instructions';

export type ShapeInfo = {
	path: string;
	width: number;
	height: number;
	transformOrigin: string;
	instructions: Instruction[];
};
