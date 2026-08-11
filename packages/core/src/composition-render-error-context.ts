import {createContext} from 'react';

export type CompositionRenderErrorContextType = {
	setError: (error: Error) => void;
	clearError: () => void;
};

export const CompositionRenderErrorContext =
	createContext<CompositionRenderErrorContextType>({
		setError: () => {},
		clearError: () => {},
	});
