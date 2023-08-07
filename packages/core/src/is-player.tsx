import type {PropsWithChildren} from 'react';
import {createContext, useContext} from 'react';

const IsPlayerContext = createContext(false);

export const IsPlayerContextProvider: React.FC<PropsWithChildren> = ({
	children,
}) => {
	return <IsPlayerContext.Provider value>{children}</IsPlayerContext.Provider>;
};

export const useIsPlayer = (): boolean => {
	return useContext(IsPlayerContext);
};
