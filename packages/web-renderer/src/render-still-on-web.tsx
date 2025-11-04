import {type ComponentType, type LazyExoticComponent} from 'react';
import ReactDOM from 'react-dom/client';
import type {_InternalTypes, CompositionManagerContext} from 'remotion';
import {Internals} from 'remotion';
import {compose} from './compose';
import {findCanvasElements} from './find-canvas-elements';
import {findSvgElements} from './find-svg-elements';
import {waitForReady} from './wait-for-ready';

const COMP_ID = 'markup';

export const renderStillOnWeb = async ({
	Component,
	width,
	height,
	fps,
	durationInFrames,
	frame,
}: {
	Component:
		| LazyExoticComponent<ComponentType<Record<string, unknown>>>
		| ComponentType<Record<string, unknown>>;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	frame: number;
}) => {
	const div = document.createElement('div');

	// Match same behavior as renderEntry.tsx
	div.style.display = 'flex';
	div.style.backgroundColor = 'transparent';
	div.style.position = 'fixed';
	div.style.width = `${width}px`;
	div.style.height = `${height}px`;
	div.style.zIndex = '-9999';

	document.body.appendChild(div);

	// TODO: Hardcoded
	const delayRenderTimeoutInMilliseconds = 10000;

	if (!ReactDOM.createRoot) {
		throw new Error('@remotion/web-renderer requires React 18 or higher');
	}

	// TODO: Env variables
	// TODO: Input Props
	// TODO: Default props
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
			defaultProResProfile: null,
		},
		folders: [],
		compositions: [
			{
				// TODO: Make dynamic
				id: COMP_ID,
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
			compositionId: COMP_ID,
		},
	};

	const root = ReactDOM.createRoot(div);

	const delayRenderScope: _InternalTypes['DelayRenderScope'] = {
		remotion_renderReady: true,
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: delayRenderTimeoutInMilliseconds,
		remotion_attempt: 0,
	};

	root.render(
		<Internals.RemotionEnvironmentContext
			value={{
				isStudio: false,
				isRendering: true,
				isPlayer: false,
				isReadOnlyStudio: false,
				isClientSideRendering: true,
			}}
		>
			<Internals.DelayRenderContextType.Provider value={delayRenderScope}>
				<Internals.RemotionRoot
					// TODO: Hardcoded
					audioEnabled
					// TODO: Hardcoded
					videoEnabled
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
						// TODO: Hardcoded
						defaultProResProfile: null,
					}}
					// TODO: Hardcoded
					audioLatencyHint="interactive"
				>
					<Internals.CanUseRemotionHooks value>
						<Internals.TimelinePosition.TimelineContext.Provider
							value={{
								// TODO: TimelineContext is already provided by RemotionRoot
								frame: {
									[COMP_ID]: frame,
								},
								playing: false,
								rootId: '',
								playbackRate: 1,
								imperativePlaying: {
									current: false,
								},
								setPlaybackRate: () => {
									throw new Error('setPlaybackRate');
								},
								audioAndVideoTags: {current: []},
							}}
						>
							<Internals.CompositionManager.Provider
								// TODO: This context is double-wrapped
								value={compositionManagerContext}
							>
								<Component />
							</Internals.CompositionManager.Provider>
						</Internals.TimelinePosition.TimelineContext.Provider>
					</Internals.CanUseRemotionHooks>
				</Internals.RemotionRoot>
			</Internals.DelayRenderContextType.Provider>
		</Internals.RemotionEnvironmentContext>,
	);

	// TODO: Scope cancelRender()
	await waitForReady(delayRenderTimeoutInMilliseconds, delayRenderScope);
	const canvasElements = findCanvasElements(div);
	const svgElements = findSvgElements(div);
	const composed = await compose({
		composables: [...canvasElements, ...svgElements],
		width,
		height,
	});

	const imageData = await composed.convertToBlob({
		type: 'image/png',
	});

	root.unmount();
	div.remove();

	return imageData;
};
