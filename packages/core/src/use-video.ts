import {useContext, useMemo} from 'react';
import {CompositionManager} from './CompositionManager';

export const useVideo = () => {
	const context = useContext(CompositionManager);

	return useMemo(() => {
		const selected = context.compositions.find((c) => {
			return c.id === context.currentComposition;
		});

		if (selected) {
			return {
				...selected,
				// We override the selected metadata with the metadata that was passed to renderMedia(),
				// and don't allow it to be changed during render anymore
				...(context.currentCompositionMetadata ?? {}),
			};
		}

		return null;
	}, [
		context.compositions,
		context.currentComposition,
		context.currentCompositionMetadata,
	]);
};
