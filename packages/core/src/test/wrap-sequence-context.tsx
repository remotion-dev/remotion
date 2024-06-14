import React from 'react';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks.js';
import type {CompositionManagerContext} from '../CompositionManagerContext.js';
import {CompositionManager} from '../CompositionManagerContext.js';
import {ResolveCompositionConfig} from '../ResolveCompositionConfig.js';
import {BufferingProvider} from '../buffering.js';

const Comp: React.FC = () => null;

const mockCompositionContext: CompositionManagerContext = {
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
	folders: [],
	registerComposition: () => undefined,
	registerFolder: () => undefined,
	unregisterComposition: () => undefined,
	unregisterFolder: () => undefined,
	canvasContent: {type: 'composition', compositionId: 'my-comp'},
};

export const WrapSequenceContext: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<BufferingProvider>
			<CanUseRemotionHooksProvider>
				<CompositionManager.Provider value={mockCompositionContext}>
					<ResolveCompositionConfig>{children}</ResolveCompositionConfig>
				</CompositionManager.Provider>
			</CanUseRemotionHooksProvider>
		</BufferingProvider>
	);
};
