import React from 'react';
import {SpringConfig} from 'remotion';

export type TransitionTiming = {
	type: 'spring';
	config: Partial<SpringConfig>;
};

export type TransitionSeriesTransitionProps = {
	timing: TransitionTiming;
};

export const TransitionSeriesTransition: React.FC<
	TransitionSeriesTransitionProps
> = () => {
	return null;
};
