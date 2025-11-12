import {type ComponentType, type LazyExoticComponent} from 'react';
import ReactDOM from 'react-dom/client';
import type {_InternalTypes, LogLevel} from 'remotion';
import {Internals} from 'remotion';
import {compose} from './compose';
import {findCanvasElements} from './find-canvas-elements';
import {findSvgElements} from './find-svg-elements';
import {waitForReady} from './wait-for-ready';

type MandatoryRenderStillOnWebOptions<T extends Record<string, unknown>> = {
	Component: LazyExoticComponent<ComponentType<T>> | ComponentType<T>;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	frame: number;
	inputProps: T;
};

type OptionalRenderStillOnWebOptions = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
};

type InternalRenderStillOnWebOptions<T extends Record<string, unknown>> =
	MandatoryRenderStillOnWebOptions<T> & OptionalRenderStillOnWebOptions;

type RenderStillOnWebOptions<T extends Record<string, unknown>> =
	MandatoryRenderStillOnWebOptions<T> &
		Partial<OptionalRenderStillOnWebOptions>;

const COMP_ID = 'markup';

async function internalRenderStillOnWeb<T extends Record<string, unknown>>({
	Component,
	width,
	height,
	fps,
	durationInFrames,
	frame,
	delayRenderTimeoutInMilliseconds,
	logLevel,
	inputProps,
}: InternalRenderStillOnWebOptions<T>) {
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
							// @ts-expect-error
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
							<Component {...inputProps} />
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
}

export const renderStillOnWeb = <T extends Record<string, unknown>>(
	options: RenderStillOnWebOptions<T>,
) => {
	return internalRenderStillOnWeb({
		...options,
		delayRenderTimeoutInMilliseconds:
			options.delayRenderTimeoutInMilliseconds ?? 30000,
		logLevel: options.logLevel ?? 'info',
	});
};
