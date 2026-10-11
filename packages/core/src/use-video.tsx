import type {ComponentType, LazyExoticComponent} from 'react';
import React, {createContext, useContext, useMemo} from 'react';
import {
	CompositionManager,
	getAssetPreviewCompositionId,
} from './CompositionManagerContext.js';
import {useResolvedVideoConfig} from './ResolveCompositionConfig.js';
import type {VideoConfig} from './video-config.js';

type VideoContextValue =
	| (VideoConfig & {
			component:
				| LazyExoticComponent<ComponentType<Record<string, unknown>>>
				| ComponentType<Record<string, unknown>>;
	  })
	| null;

const AssetPreviewComposition = () => null;

export const VideoContext = createContext<VideoContextValue>(null);

// Share resolution across consumers. Place below editor props and metadata providers.
export const VideoProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {
		canvasContent,
		compositions,
		currentCompositionMetadata,
		currentAssetMetadata,
	} = useContext(CompositionManager);

	const selected = compositions.find((c) => {
		return (
			canvasContent?.type === 'composition' &&
			c.id === canvasContent.compositionId
		);
	});
	const resolved = useResolvedVideoConfig(selected?.id ?? null);

	const video = useMemo((): VideoContextValue => {
		if (
			canvasContent?.type === 'asset' &&
			currentAssetMetadata?.asset === canvasContent.asset
		) {
			return {
				...currentAssetMetadata,
				id: getAssetPreviewCompositionId(canvasContent.asset),
				defaultProps: {},
				component: AssetPreviewComposition,
			};
		}

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
	}, [
		canvasContent,
		currentAssetMetadata,
		currentCompositionMetadata,
		resolved,
		selected,
	]);

	return (
		<VideoContext.Provider value={video}>{children}</VideoContext.Provider>
	);
};

export const useVideo = (): VideoContextValue => {
	return useContext(VideoContext);
};
