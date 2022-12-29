import type {PropsWithChildren} from 'react';
import {
	createContext,
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';

export type ClipRegion =
	| {
			x: number;
			y: number;
			width: number;
			height: number;
	  }
	| 'hide';

export type CompositionManagerContext = {
	clipRegion: ClipRegion | null;
	setClipRegion: (clip: ClipRegion | null) => void;
};

export const NativeLayersContext = createContext<CompositionManagerContext>({
	setClipRegion: () => {
		throw new Error('NativeLayers not set');
	},
	clipRegion: null,
});

export const NativeLayersProvider: React.FC<PropsWithChildren> = ({
	children,
}) => {
	const [clipRegion, setRegion] = useState<ClipRegion | null>(null);

	const setClipRegion = useCallback((region: ClipRegion | null) => {
		setRegion(region);
	}, []);

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
