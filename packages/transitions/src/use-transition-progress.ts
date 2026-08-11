import React from 'react';
import {EnteringContext, ExitingContext} from './context';

export type TransitionState = {
	entering: number;
	exiting: number;
	isInTransitionSeries: boolean;
};

/*
 * @description A hook that can be used inside a child of a <TransitionSeries.Sequence> to get the progress of the transition to directly manipulate the objects inside the scene.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/use-transition-progress)
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
