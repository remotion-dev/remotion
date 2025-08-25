import type {ComponentType, LazyExoticComponent} from 'react';
import ReactDOM from 'react-dom/client';
import type {CompositionManagerContext} from 'remotion';
import {Internals} from 'remotion';

export const renderMediaOnWeb = ({
	Component,
	width,
	height,
}: {
	Component: LazyExoticComponent<ComponentType<Record<string, unknown>>>;
	width: number;
	height: number;
}) => {
	const div = document.createElement('div');

	// Match same behavior as renderEntry.tsx
	div.style.display = 'flex';
	div.style.backgroundColor = 'transparent';
	div.style.width = `${width}px`;
	div.style.height = `${height}px`;

	document.body.appendChild(div);

	if (!ReactDOM.createRoot) {
		throw new Error('@remotion/web-renderer requires React 18 or higher');
	}

	// TODO: Env variables
	// TODO: Input Props
	// TODO: calculateMetadata()
	// TODO: getRemotionEnvironment()
	// TODO: delayRender()
	// TODO: Video config
	// TODO: window.remotion_isPlayer

	const compositionManagerContext: CompositionManagerContext = {
		currentCompositionMetadata: {
			durationInFrames: 100,
			fps: 30,
			height: 100,
			width: 100,
			props: {},
			defaultCodec: null,
			defaultOutName: null,
			defaultVideoImageFormat: null,
			defaultPixelFormat: null,
		},
		folders: [],
		compositions: [
			{
				// TODO: Make dynamic
				id: 'markup',
				component: Component,
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
	};

	ReactDOM.createRoot(div).render(
		<Internals.CompositionManager.Provider value={compositionManagerContext}>
			<Component />
		</Internals.CompositionManager.Provider>,
	);
};
