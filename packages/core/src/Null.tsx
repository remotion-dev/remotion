import {useContext, useEffect} from 'react';
import {NativeLayersContext} from './NativeLayers';

export const Null: React.FC = () => {
	const {setClipRegion} = useContext(NativeLayersContext);

	useEffect(() => {
		setClipRegion('hide');

		return () => {
			setClipRegion(null);
		};
	}, [setClipRegion]);

	return null;
};
