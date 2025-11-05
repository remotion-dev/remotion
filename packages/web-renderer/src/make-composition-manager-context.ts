import type {ComponentType, LazyExoticComponent} from 'react';
import type {CompositionManagerContext} from 'remotion';

export const COMP_ID = 'markup';

export const makeCompositionManagerContext = ({
	durationInFrames,
	fps,
	height,
	width,
	Component,
}: {
	durationInFrames: number;
	fps: number;
	height: number;
	width: number;
	Component:
		| LazyExoticComponent<ComponentType<Record<string, unknown>>>
		| ComponentType<Record<string, unknown>>;
}): CompositionManagerContext => {
	return {
		currentCompositionMetadata: {
			durationInFrames,
			fps,
			height,
			width,
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
				id: COMP_ID,
				component: Component,
				nonce: 0,
				// TODO: Do we need to allow to set this?
				defaultProps: undefined,
				folderName: null,
				parentFolderName: null,
				schema: null,
				calculateMetadata: null,
				durationInFrames,
				fps,
				height,
				width,
			},
		],
		canvasContent: {
			type: 'composition',
			compositionId: COMP_ID,
		},
	};
};
