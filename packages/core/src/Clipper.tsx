import type React from 'react';
import {useContext, useEffect} from 'react';
import {NativeLayersContext} from './NativeLayers.js';

export const Clipper: React.FC<{
	width: number;
	height: number;
	x: number;
	y: number;
}> = ({height, width, x, y}) => {
	const {setClipRegion} = useContext(NativeLayersContext);

	useEffect(() => {
		setClipRegion((c) => {
			if (c === 'hide') {
				throw new Error(
					'Cannot render <Clipper>, because another <Null> is already rendered',
				);
			}

			if (c === null) {
				return {height, width, x, y};
			}

			throw new Error(
				'Cannot render <Clipper>, because another component clipping the region was already rendered (most likely <Clipper>)',
			);
		});

		return () => {
			setClipRegion(null);
		};
	}, [height, setClipRegion, width, x, y]);

	return null;
};
