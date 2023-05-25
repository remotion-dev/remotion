import type {ComponentType, LazyExoticComponent} from 'react';
import {useContext, useMemo} from 'react';
import {CompositionManager} from './CompositionManager.js';
import {useResolvedVideoConfig} from './ResolveCompositionConfig.js';
import type {VideoConfig} from './video-config.js';

type ReturnType =
	| (VideoConfig & {
			component: LazyExoticComponent<ComponentType<unknown>>;
	  })
	| null;

export const useVideo = (): ReturnType => {
	const context = useContext(CompositionManager);

	const selected = context.compositions.find((c) => {
		return c.id === context.currentComposition;
	});
	const resolved = useResolvedVideoConfig(context.currentComposition);

	return useMemo((): ReturnType => {
		if (resolved && selected) {
			return {
				...resolved,
				defaultProps: selected.defaultProps,
				id: selected.id,
				// We override the selected metadata with the metadata that was passed to renderMedia(),
				// and don't allow it to be changed during render anymore
				...(context.currentCompositionMetadata ?? {}),
				component: selected.component,
			};
		}

		return null;
	}, [context.currentCompositionMetadata, resolved, selected]);
};
