import type React from 'react';
import type {TransitionPresentation} from './GenericTransition';
import type {TransitionTiming} from './timing';

export type TransitionSeriesTransitionProps = {
	timing: TransitionTiming;
	presentation: TransitionPresentation;
};

export const TransitionSeriesTransition: React.FC<
	TransitionSeriesTransitionProps
> = () => {
	return null;
};
