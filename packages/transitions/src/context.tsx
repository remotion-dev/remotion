import React, {useMemo} from 'react';

export type TransitionState = {
	entering: number;
	exiting: number;
	isInTransitionSeries: boolean;
};

type EnteringState = {
	enteringProgress: number;
};

type ExitingState = {
	exitingProgress: number;
};

const EnteringContext = React.createContext<EnteringState | null>(null);
const ExitingContext = React.createContext<ExitingState | null>(null);

export const WrapInEnteringProgressContext: React.FC<{
	readonly presentationProgress: number;
	readonly children: React.ReactNode;
}> = ({presentationProgress, children}) => {
	const value: EnteringState = useMemo(() => {
		return {
			enteringProgress: presentationProgress,
		};
	}, [presentationProgress]);

	return (
		<EnteringContext.Provider value={value}>
			{children}
		</EnteringContext.Provider>
	);
};

export const WrapInExitingProgressContext: React.FC<{
	readonly presentationProgress: number;
	readonly children: React.ReactNode;
}> = ({presentationProgress, children}) => {
	const value: ExitingState = useMemo(() => {
		return {
			exitingProgress: presentationProgress,
		};
	}, [presentationProgress]);

	return (
		<ExitingContext.Provider value={value}>{children}</ExitingContext.Provider>
	);
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
