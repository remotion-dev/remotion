import {useContext, useEffect} from 'react';
import {CompositionManager} from './CompositionManager';

export const Null: React.FC = () => {
	const context = useContext(CompositionManager);

	useEffect(() => {
		context.setClipRegion('hide');

		return () => {
			context.setClipRegion(null);
		};
	}, [context]);

	return null;
};
