import {useContext} from 'react';
import {CompositionManager} from './CompositionManager';

export const useVideo = () => {
	const context = useContext(CompositionManager);
	return (
		context.compositions.find((c) => {
			return c.id === context.currentComposition;
		}) ?? null
	);
};
