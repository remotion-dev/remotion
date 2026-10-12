import React, {useMemo} from 'react';

type EnteringState = {
	enteringProgress: number;
};

type ExitingState = {
	exitingProgress: number;
};

export const EnteringContext = React.createContext<EnteringState | null>(null);
export const ExitingContext = React.createContext<ExitingState | null>(null);

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
