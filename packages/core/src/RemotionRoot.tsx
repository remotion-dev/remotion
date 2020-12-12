import React, {useCallback, useMemo, useState} from 'react';
import {CompositionManager, TComposition} from './CompositionManager';

export const RemotionRoot: React.FC = ({children}) => {
	const [compositions, setCompositions] = useState<TComposition[]>([]);

	const registerComposition = useCallback((comp: TComposition) => {
		setCompositions((comps) => {
			if (comps.find((c) => c.name === comp.name)) {
				throw new Error(
					`Multiple composition with name ${comp.name} are registered.`
				);
			}
			return [...comps, comp];
		});
	}, []);

	const unregisterComposition = useCallback((name: string) => {
		setCompositions((comps) => {
			return comps.filter((c) => c.name !== name);
		});
	}, []);

	const contextValue = useMemo(() => {
		return {
			compositions,
			registerComposition,
			unregisterComposition,
		};
	}, [compositions, registerComposition, unregisterComposition]);

	return (
		<CompositionManager.Provider value={contextValue}>
			{children}
		</CompositionManager.Provider>
	);
};
