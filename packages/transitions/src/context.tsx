import React, {useContext, useMemo} from 'react';

type EnteringState = {
	enteringProgress: number;
};

type ExitingState = {
	exitingProgress: number;
};

export const EnteringContext = React.createContext<EnteringState | null>(null);
export const ExitingContext = React.createContext<ExitingState | null>(null);

export const WrapInEnteringProgressContext: React.FC<{
	readonly presentationProgress: number | null;
	readonly children: React.ReactNode;
}> = ({presentationProgress, children}) => {
	const inheritedValue = useContext(EnteringContext);
	const value: EnteringState | null = useMemo(() => {
		return presentationProgress === null
			? inheritedValue
			: {
					enteringProgress: presentationProgress,
				};
	}, [inheritedValue, presentationProgress]);

	return (
		<EnteringContext.Provider value={value}>
			{children}
		</EnteringContext.Provider>
	);
};

export const WrapInExitingProgressContext: React.FC<{
	readonly presentationProgress: number | null;
	readonly children: React.ReactNode;
}> = ({presentationProgress, children}) => {
	const inheritedValue = useContext(ExitingContext);
	const value: ExitingState | null = useMemo(() => {
		return presentationProgress === null
			? inheritedValue
			: {
					exitingProgress: presentationProgress,
				};
	}, [inheritedValue, presentationProgress]);

	return (
		<ExitingContext.Provider value={value}>{children}</ExitingContext.Provider>
	);
};
