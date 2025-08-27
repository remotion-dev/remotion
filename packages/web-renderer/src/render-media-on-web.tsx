import type {ComponentType, LazyExoticComponent} from 'react';
import ReactDOM from 'react-dom/client';
import type {CompositionManagerContext} from 'remotion';
import {Internals} from 'remotion';
import {compose} from './compose';
import {findCanvasElements} from './find-canvas-elements';
import {waitForReady} from './wait-for-ready';

export const renderMediaOnWeb = async ({
	Component,
	width,
	height,
	fps,
	durationInFrames,
}: {
	Component: LazyExoticComponent<ComponentType<Record<string, unknown>>>;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
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
			durationInFrames,
			fps,
			height,
			width,
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
				durationInFrames,
				fps,
				height,
				width,
			},
		],
		canvasContent: {
			type: 'composition',
			compositionId: 'markup',
		},
	};

	const root = ReactDOM.createRoot(div);

	root.render(
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
				durationInFrames,
				// TODO: Hardcoded
				fps,
				// TODO: Hardcoded
				height,
				// TODO: Hardcoded
				width,
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
	const canvasElements = findCanvasElements(div);
	const composed = compose({
		composables: canvasElements,
		width,
		height,
	});

	const imageData = await composed.convertToBlob({
		type: 'image/png',
	});

	// download image
	const blob = new Blob([imageData], {type: 'image/png'});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'composed.png';
	a.click();
	URL.revokeObjectURL(url);

	root.unmount();
	div.remove();
};
