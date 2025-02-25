import type {ComponentType} from 'react';
import React from 'react';
import type {CompositionManagerContext} from 'remotion';

const Mock: React.FC = () => null;

export const makeMockCompositionManagerContext =
	(): CompositionManagerContext => {
		return {
			currentCompositionMetadata: {
				durationInFrames: 100,
				fps: 30,
				height: 100,
				width: 100,
				props: {},
				defaultCodec: null,
				defaultOutName: null,
			},
			folders: [],
			registerComposition: () => undefined,
			registerFolder: () => undefined,
			unregisterComposition: () => undefined,
			unregisterFolder: () => undefined,
			setCurrentCompositionMetadata: () => undefined,
			compositions: [
				{
					id: 'markup',
					component: React.lazy(() =>
						Promise.resolve({
							default: Mock as ComponentType<unknown>,
						}),
					),
					nonce: 0,
					defaultProps: undefined,
					folderName: null,
					parentFolderName: null,
					schema: null,
					calculateMetadata: null,
					durationInFrames: 100,
					fps: 30,
					height: 100,
					width: 100,
				},
			],
			canvasContent: {
				type: 'composition',
				compositionId: 'markup',
			},
			setCanvasContent: () => undefined,
			updateCompositionDefaultProps: () => undefined,
		};
	};
