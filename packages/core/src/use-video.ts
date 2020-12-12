import {useContext} from 'react';
import {CompositionManager} from './CompositionManager';

export const useVideo = () => {
	const context = useContext(CompositionManager);
	if (!context.compositions.length) {
		throw new Error('No compositions registered');
	}
	return context.compositions[0].component;
};
