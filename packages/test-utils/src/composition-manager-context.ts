import type {ComponentType} from 'react';
import React from 'react';
import type {CompositionManagerContext} from 'remotion';
import {ID} from './id.js';

const Mock: React.FC = () => null;

export const makeMockCompositionManagerContext =
	(): CompositionManagerContext => {
		return {
			currentCompositionMetadata: {
				durationInFrames: 500,
				fps: 30,
				height: 100,
				width: 100,
				props: {},
				defaultCodec: null,
				defaultOutName: null,
				defaultVideoImageFormat: null,
				defaultPixelFormat: null,
				defaultProResProfile: null,
			},
			folders: [],
			compositions: [
				{
					id: ID,
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
				compositionId: ID,
			},
		};
	};
