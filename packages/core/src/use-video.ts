import type {ComponentType, LazyExoticComponent} from 'react';
import {useContext, useMemo} from 'react';
import {CompositionManager} from './CompositionManagerContext.js';
import {useResolvedVideoConfig} from './ResolveCompositionConfig.js';
import type {VideoConfig} from './video-config.js';

type ReturnType =
	| (VideoConfig & {
			component: LazyExoticComponent<ComponentType<Record<string, unknown>>>;
	  })
	| null;

export const useVideo = (): ReturnType => {
	const {canvasContent, compositions, currentCompositionMetadata} =
		useContext(CompositionManager);

	const selected = compositions.find((c) => {
		return (
			canvasContent?.type === 'composition' &&
			c.id === canvasContent.compositionId
		);
	});
	const resolved = useResolvedVideoConfig(selected?.id ?? null);

	return useMemo((): ReturnType => {
		if (!resolved) {
			return null;
		}

		if (resolved.type === 'error') {
			return null;
		}

		if (resolved.type === 'loading') {
			return null;
		}

		if (!selected) {
			return null;
		}

		return {
			...resolved.result,
			defaultProps: selected.defaultProps ?? {},
			id: selected.id,
			// We override the selected metadata with the metadata that was passed to renderMedia(),
			// and don't allow it to be changed during render anymore
			...(currentCompositionMetadata ?? {}),
			component: selected.component,
		};
	}, [currentCompositionMetadata, resolved, selected]);
};
