import React, {createContext, useEffect, useState} from 'react';
import {
	getPreloads,
	type PrefetchState,
	subscribeToPreloads,
} from './prefetch-state-shared.js';

export const PreloadContext = createContext<PrefetchState>({});

export const PrefetchProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [_preloads, _setPreloads] = useState<PrefetchState>(getPreloads);

	useEffect(() => {
		return subscribeToPreloads(_setPreloads);
	}, []);

	return (
		<PreloadContext.Provider value={_preloads}>
			{children}
		</PreloadContext.Provider>
	);
};
