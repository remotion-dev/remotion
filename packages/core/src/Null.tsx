import {useContext, useEffect} from 'react';
import {NativeLayersContext} from './NativeLayers.js';

export const Null: React.FC = () => {
	const {setClipRegion} = useContext(NativeLayersContext);

	useEffect(() => {
		setClipRegion((c) => {
			if (c === null) {
				return 'hide';
			}

			// Rendering multiple <Null> is fine, because they are all hidden
			if (c === 'hide') {
				return 'hide';
			}

			throw new Error(
				'Cannot render <Null>, because another component clipping the region was already rendered (most likely <Clipper>)',
			);
		});

		return () => {
			setClipRegion(null);
		};
	}, [setClipRegion]);

	return null;
};
