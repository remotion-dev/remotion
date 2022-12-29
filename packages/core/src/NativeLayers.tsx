import type {PropsWithChildren} from 'react';
import {createContext, useLayoutEffect, useMemo, useState} from 'react';

export type ClipRegion =
	| {
			x: number;
			y: number;
			width: number;
			height: number;
	  }
	| 'hide';

export type TNativeLayersContext = {
	clipRegion: ClipRegion | null;
	setClipRegion: React.Dispatch<React.SetStateAction<ClipRegion | null>>;
};

export const NativeLayersContext = createContext<TNativeLayersContext>({
	setClipRegion: () => {
		throw new Error('NativeLayers not set');
	},
	clipRegion: null,
});

export const NativeLayersProvider: React.FC<PropsWithChildren> = ({
	children,
}) => {
	const [clipRegion, setClipRegion] = useState<ClipRegion | null>(null);

	const context = useMemo(() => {
		return {
			setClipRegion,
			clipRegion,
		};
	}, [clipRegion, setClipRegion]);

	useLayoutEffect(() => {
		if (typeof window !== 'undefined') {
			window.remotion_getClipRegion = () => {
				setClipRegion(null); // clear assets at next render
				return clipRegion;
			};
		}
	}, [clipRegion, setClipRegion]);

	return (
		<NativeLayersContext.Provider value={context}>
			{children}
		</NativeLayersContext.Provider>
	);
};
