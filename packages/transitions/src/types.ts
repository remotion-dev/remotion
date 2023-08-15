export type TransitionDirection = 'in' | 'out';

export type TransitionTiming = {
	getDurationInFrames: (options: {fps: number}) => number;
	getProgress: (options: {frame: number; fps: number}) => number;
};

export type TransitionSeriesTransitionProps = {
	timing: TransitionTiming;
	presentation: TransitionPresentation;
};

export type TransitionPresentation =
	| {
			type: 'triangle';
	  }
	| {
			type: 'slide';
	  };
