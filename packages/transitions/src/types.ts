import type React from 'react';
import type {ComponentType} from 'react';
import type {AbsoluteFillLayout, SequencePropsWithoutDuration} from 'remotion';
import type {HtmlInCanvasShader} from './html-in-canvas-presentation';
import type {DrawFunction} from './TransitionSeries';

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
	/** Blurs the presentation's movement while sampling scene contents once per frame. */
	motionBlur?: TransitionMotionBlur;
};

export type TransitionMotionBlur = {
	/** Defaults to 180. */
	shutterAngle?: number;
	/** Defaults to 16. */
	samples?: number;
};

type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);

export type TransitionPresentation<
	PresentationProps extends Record<string, unknown>,
> = {
	component: LooseComponentType<
		TransitionPresentationComponentProps<PresentationProps>
	>;
	props: PresentationProps;
	/** Optional renderer for motion blur using captured scenes. */
	canvas?: HtmlInCanvasShader<PresentationProps>;
};

export type TransitionPresentationComponentProps<
	PresentationProps extends Record<string, unknown>,
> = {
	presentationProgress: number;
	children: React.ReactNode;
	presentationDirection: PresentationDirection;
	passedProps: PresentationProps;
	presentationDurationInFrames: number;
	onElementImage: (elementImage: OffscreenCanvas, draw: DrawFunction) => void;
	onUnmount: () => void;
	bothEnteringAndExiting: boolean;
};

export type TransitionSeriesOverlayProps = Pick<
	AbsoluteFillLayout,
	| 'premountFor'
	| 'postmountFor'
	| 'styleWhilePremounted'
	| 'styleWhilePostmounted'
> &
	Pick<SequencePropsWithoutDuration, 'hidden'> & {
		readonly durationInFrames: number;
		readonly offset?: number;
		readonly children: React.ReactNode;
	};
