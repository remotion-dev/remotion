import React from 'react';
import {EnteringContext, ExitingContext} from './context';

export type TransitionState = {
	entering: number;
	exiting: number;
	isInTransitionSeries: boolean;
};

/**
 * Gets the progress and direction of a transition with a context() presentation.
 */
export const useTransitionProgress = (): TransitionState => {
	const entering = React.useContext(EnteringContext);
	const exiting = React.useContext(ExitingContext);

	if (!entering && !exiting) {
		return {
			isInTransitionSeries: false,
			entering: 1,
			exiting: 0,
		};
	}

	return {
		isInTransitionSeries: true,
		entering: entering?.enteringProgress ?? 1,
		exiting: exiting?.exitingProgress ?? 0,
	};
};
