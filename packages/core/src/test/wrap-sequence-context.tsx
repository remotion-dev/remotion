import React from 'react';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks.js';
import type {CompositionManagerContext} from '../CompositionManagerContext.js';
import {CompositionManager} from '../CompositionManagerContext.js';
import {ResolveCompositionConfig} from '../ResolveCompositionConfig.js';

const Comp: React.FC = () => null;

export const mockCompositionContext: CompositionManagerContext = {
	assets: [],
	compositions: [
		{
			id: 'my-comp',
			durationInFrames: 1000000,
			// @ts-expect-error
			component: Comp,
			defaultProps: {},
			folderName: null,
			fps: 30,
			height: 1080,
			width: 1080,
			parentFolderName: null,
			nonce: 0,
			calculateMetadata: null,
		},
	],
	currentComposition: 'my-comp',
	folders: [],
	registerAsset: () => undefined,
	registerComposition: () => undefined,
	registerFolder: () => undefined,
	setCurrentComposition: () => undefined,
	unregisterAsset: () => undefined,
	unregisterComposition: () => undefined,
	unregisterFolder: () => undefined,
};

export const WrapSequenceContext: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	return (
		<CanUseRemotionHooksProvider>
			<CompositionManager.Provider value={mockCompositionContext}>
				<ResolveCompositionConfig>{children}</ResolveCompositionConfig>
			</CompositionManager.Provider>
		</CanUseRemotionHooksProvider>
	);
};
