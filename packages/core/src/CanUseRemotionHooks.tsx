import React, {createContext} from 'react';

export const CanUseRemotionHooks = createContext<boolean>(false);

export const CanUseRemotionHooksProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<CanUseRemotionHooks.Provider value>
			{children}
		</CanUseRemotionHooks.Provider>
	);
};
