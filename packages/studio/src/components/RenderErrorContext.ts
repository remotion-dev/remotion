import {createContext} from 'react';

export type RenderErrorContextType = {
	error: Error | null;
};

export const RenderErrorContext = createContext<RenderErrorContextType>({
	error: null,
});
