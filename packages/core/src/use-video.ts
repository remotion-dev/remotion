import {useContext, useMemo} from 'react';
import {CompositionManager} from './CompositionManager';

export const useVideo = () => {
	const context = useContext(CompositionManager);
	return useMemo(
		() =>
			context.compositions.find((c) => {
				return c.id === context.currentComposition;
			}) ?? null,
		[context.compositions, context.currentComposition]
	);
};
