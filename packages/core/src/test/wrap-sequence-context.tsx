import React from 'react';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks';
import type {CompositionManagerContext} from '../CompositionManager';
import {CompositionManager} from '../CompositionManager';

const Comp: React.FC = () => null;

export const mockCompositionContext: CompositionManagerContext = {
	assets: [],
	compositions: [
		{
			id: 'my-comp',
			durationInFrames: 100,
			// @ts-expect-error
			component: Comp,
			defaultProps: {},
			folderName: null,
			fps: 30,
			height: 1080,
			width: 1080,
			parentFolderName: null,
			nonce: 0,
		},
	],
	currentComposition: 'my-comp',
	folders: [],
	registerAsset: () => undefined,
	registerComposition: () => undefined,
	registerFolder: () => undefined,
	registerSequence: () => undefined,
	sequences: [],
	setCurrentComposition: () => undefined,
	unregisterAsset: () => undefined,
	unregisterComposition: () => undefined,
	unregisterFolder: () => undefined,
	unregisterSequence: () => undefined,
};

export const WrapSequenceContext: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	return (
		<CanUseRemotionHooksProvider>
			<CompositionManager.Provider value={mockCompositionContext}>
				{children}
			</CompositionManager.Provider>
		</CanUseRemotionHooksProvider>
	);
};
