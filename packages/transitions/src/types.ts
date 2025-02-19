import type {ComponentType} from 'react';

export type PresentationDirection = 'entering' | 'exiting';

export type TransitionTiming = {
	getDurationInFrames: (options: {fps: number}) => number;
	getProgress: (options: {frame: number; fps: number}) => number;
};

export type TransitionSeriesTransitionProps<
	PresentationProps extends Record<string, unknown>,
> = {
	timing: TransitionTiming;
	presentation?: TransitionPresentation<PresentationProps>;
};

type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);

export type TransitionPresentation<
	PresentationProps extends Record<string, unknown>,
> = {
	component: LooseComponentType<
		TransitionPresentationComponentProps<PresentationProps>
	>;
	props: PresentationProps;
};

export type TransitionPresentationComponentProps<
	PresentationProps extends Record<string, unknown>,
> = {
	presentationProgress: number;
	children: React.ReactNode;
	presentationDirection: PresentationDirection;
	passedProps: PresentationProps;
	presentationDurationInFrames: number;
};
