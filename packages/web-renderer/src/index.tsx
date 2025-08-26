import type {ComponentType, LazyExoticComponent} from 'react';
import ReactDOM from 'react-dom/client';
import type {CompositionManagerContext} from 'remotion';
import {Internals} from 'remotion';
import {findCanvasElements} from './find-canvas-elements';
import {waitForReady} from './wait-for-ready';

export const renderMediaOnWeb = async ({
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
	div.style.position = 'absolute';
	div.style.width = `${width}px`;
	div.style.height = `${height}px`;

	document.body.appendChild(div);

	// TODO: Hardcoded
	const delayRenderTimeoutInMilliseconds = 10000;

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
	// TODO: Log Level

	const compositionManagerContext: CompositionManagerContext = {
		currentCompositionMetadata: {
			durationInFrames: 100,
			fps: 30,
			height: 1080,
			width: 1080,
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
				height: 1080,
				width: 1080,
			},
		],
		canvasContent: {
			type: 'composition',
			compositionId: 'markup',
		},
	};

	ReactDOM.createRoot(div).render(
		<Internals.RemotionRoot
			// TODO: Hardcoded
			logLevel="info"
			// TODO: Hardcoded
			numberOfAudioTags={0}
			// TODO: Hardcoded
			onlyRenderComposition={null}
			// TODO: Hardcoded
			currentCompositionMetadata={{
				// TODO: Empty
				props: {},
				// TODO: Hardcoded
				durationInFrames: 100,
				// TODO: Hardcoded
				fps: 30,
				// TODO: Hardcoded
				height: 1080,
				// TODO: Hardcoded
				width: 1080,
				// TODO: Hardcoded
				defaultCodec: null,
				// TODO: Hardcoded
				defaultOutName: null,
				// TODO: Hardcoded
				defaultVideoImageFormat: null,
				// TODO: Hardcoded
				defaultPixelFormat: null,
			}}
			// TODO: Hardcoded
			audioLatencyHint="interactive"
		>
			<Internals.CanUseRemotionHooks value>
				<Internals.CompositionManager.Provider
					// TODO: This context is double-wrapped
					value={compositionManagerContext}
				>
					<Component />
				</Internals.CompositionManager.Provider>
			</Internals.CanUseRemotionHooks>
		</Internals.RemotionRoot>,
	);

	await waitForReady(delayRenderTimeoutInMilliseconds);
	findCanvasElements(div);
};
