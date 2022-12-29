import type React from 'react';
import {useContext, useEffect} from 'react';
import {NativeLayersContext} from './NativeLayers';

export const Clipper: React.FC<{
	width: number;
	height: number;
	x: number;
	y: number;
}> = ({height, width, x, y}) => {
	const {setClipRegion} = useContext(NativeLayersContext);

	useEffect(() => {
		setClipRegion({height, width, x, y});

		return () => {
			setClipRegion(null);
		};
	}, [height, setClipRegion, width, x, y]);

	return null;
};
