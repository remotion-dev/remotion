import React, {useMemo} from 'react';

export type TransitionState = {
	progress: number;
	direction: 'entering' | 'exiting';
};

const NonePresentationContext = React.createContext<TransitionState | null>(
	null,
);

export const WrapInProgressContext: React.FC<{
	presentationProgress: number;
	presentationDirection: 'entering' | 'exiting';
	children: React.ReactNode;
}> = ({presentationDirection, presentationProgress, children}) => {
	const value: TransitionState = useMemo(() => {
		return {
			progress: presentationProgress,
			direction: presentationDirection,
		};
	}, [presentationDirection, presentationProgress]);

	return (
		<NonePresentationContext.Provider value={value}>
			{children}
		</NonePresentationContext.Provider>
	);
};

/**
 * Gets the progress and direction of a transition with a context() presentation.
 */
export const useProgress = () => {
	const value = React.useContext(NonePresentationContext);
	if (!value) {
		return null;
	}

	return value;
};
