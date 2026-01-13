import type {SpringConfig} from 'remotion';

export type DraggedConfig = SpringConfig & {
	reverse: boolean;
	durationInFrames: number | null;
	delay: number;
};
