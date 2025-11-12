import {type ComponentType, type LazyExoticComponent} from 'react';
import ReactDOM from 'react-dom/client';
import type {_InternalTypes, LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {compose} from './compose';
import {findCanvasElements} from './find-canvas-elements';
import {findSvgElements} from './find-svg-elements';
import {waitForReady} from './wait-for-ready';

type MandatoryRenderStillOnWebOptions = {
	Component:
		| LazyExoticComponent<ComponentType<Record<string, unknown>>>
		| ComponentType<Record<string, unknown>>;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	frame: number;
};

type OptionalRenderStillOnWebOptions = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
};

type InternalRenderStillOnWebOptions = MandatoryRenderStillOnWebOptions &
	OptionalRenderStillOnWebOptions;

type RenderStillOnWebOptions = MandatoryRenderStillOnWebOptions &
	Partial<OptionalRenderStillOnWebOptions>;

const COMP_ID = 'markup';

const internalRenderStillOnWeb = async ({
	Component,
	width,
	height,
	fps,
	durationInFrames,
	frame,
	delayRenderTimeoutInMilliseconds,
	logLevel,
}: InternalRenderStillOnWebOptions) => {
	const div = document.createElement('div');

	// Match same behavior as renderEntry.tsx
	div.style.display = 'flex';
	div.style.backgroundColor = 'transparent';
	div.style.position = 'fixed';
	div.style.width = `${width}px`;
	div.style.height = `${height}px`;
	div.style.zIndex = '-9999';

	document.body.appendChild(div);

	if (!ReactDOM.createRoot) {
		throw new Error('@remotion/web-renderer requires React 18 or higher');
	}

	// TODO: Env variables
	// TODO: Input Props
	// TODO: Default props
	// TODO: getInputProps()
	// TODO: calculateMetadata()
	// TODO: getRemotionEnvironment()
	// TODO: delayRender()
	// TODO: Video config
	// TODO: window.remotion_isPlayer

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
				<Internals.CompositionManagerProvider
					initialCanvasContent={{
						type: 'composition',
						compositionId: COMP_ID,
					}}
					onlyRenderComposition={null}
					// TODO: Hardcoded
					currentCompositionMetadata={{
						// TODO: Empty
						props: {},
						durationInFrames,
						fps,
						height,
						width,
						defaultCodec: null,
						defaultOutName: null,
						defaultVideoImageFormat: null,
						defaultPixelFormat: null,
						defaultProResProfile: null,
					}}
					initialCompositions={[
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
					]}
				>
					<Internals.RemotionRoot
						audioEnabled={false}
						videoEnabled
						logLevel={logLevel}
						numberOfAudioTags={0}
						audioLatencyHint="interactive"
						frameState={{
							[COMP_ID]: frame,
						}}
					>
						<Internals.CanUseRemotionHooks value>
							<Component />
						</Internals.CanUseRemotionHooks>
					</Internals.RemotionRoot>
				</Internals.CompositionManagerProvider>
			</Internals.DelayRenderContextType.Provider>
		</Internals.RemotionEnvironmentContext>,
	);

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

export const renderStillOnWeb = (options: RenderStillOnWebOptions) => {
	return internalRenderStillOnWeb({
		...options,
		delayRenderTimeoutInMilliseconds:
			options.delayRenderTimeoutInMilliseconds ?? 30000,
		logLevel: options.logLevel ?? 'info',
	});
};
