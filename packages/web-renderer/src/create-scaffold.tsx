import {createRef, type ComponentType} from 'react';
import {flushSync} from 'react-dom';
import ReactDOM from 'react-dom/client';
import type {Codec, LogLevel} from 'remotion';
import {Internals, type _InternalTypes} from 'remotion';
import type {AnyZodObject} from 'zod';
import type {TimeUpdaterRef} from './update-time';
import {UpdateTime} from './update-time';
import {withResolvers} from './with-resolvers';

export async function createScaffold<Props extends Record<string, unknown>>({
	width,
	height,
	delayRenderTimeoutInMilliseconds,
	logLevel,
	resolvedProps,
	id,
	mediaCacheSizeInBytes,
	durationInFrames,
	fps,
	initialFrame,
	schema,
	Component,
	audioEnabled,
	videoEnabled,
	defaultCodec,
	defaultOutName,
}: {
	width: number;
	height: number;
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
	resolvedProps: Record<string, unknown>;
	id: string;
	mediaCacheSizeInBytes: number | null;
	initialFrame: number;
	durationInFrames: number;
	fps: number;
	schema: AnyZodObject | null;
	Component: ComponentType<Props>;
	audioEnabled: boolean;
	videoEnabled: boolean;
	defaultCodec: Codec | null;
	defaultOutName: string | null;
}): Promise<{
	delayRenderScope: _InternalTypes['DelayRenderScope'];
	div: HTMLDivElement;
	cleanupScaffold: () => void;
	timeUpdater: React.RefObject<TimeUpdaterRef | null>;
}> {
	if (!ReactDOM.createRoot) {
		throw new Error('@remotion/web-renderer requires React 18 or higher');
	}

	const div = document.createElement('div');

	// Match same behavior as renderEntry.tsx
	div.style.display = 'flex';
	div.style.backgroundColor = 'transparent';
	div.style.position = 'fixed';
	div.style.width = `${width}px`;
	div.style.height = `${height}px`;
	div.style.zIndex = '-9999';

	document.body.appendChild(div);

	const {promise, resolve, reject} = withResolvers<void>();

	// TODO: This might not work in React 18
	const root = ReactDOM.createRoot(div, {
		onUncaughtError: (err) => {
			reject(err);
		},
	});

	const delayRenderScope: _InternalTypes['DelayRenderScope'] = {
		remotion_renderReady: true,
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: delayRenderTimeoutInMilliseconds,
		remotion_attempt: 0,
	};

	const timeUpdater = createRef<TimeUpdaterRef | null>();

	flushSync(() => {
		root.render(
			<Internals.MaxMediaCacheSizeContext.Provider
				value={mediaCacheSizeInBytes}
			>
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
						<Internals.CompositionManager.Provider
							value={{
								compositions: [
									{
										id,
										// @ts-expect-error
										component: Component,
										nonce: 0,
										defaultProps: {},
										folderName: null,
										parentFolderName: null,
										schema: schema ?? null,
										calculateMetadata: null,
										durationInFrames,
										fps,
										height,
										width,
									},
								],
								canvasContent: {
									type: 'composition',
									compositionId: id,
								},
								currentCompositionMetadata: {
									props: resolvedProps,
									durationInFrames,
									fps,
									height,
									width,
									defaultCodec: defaultCodec ?? null,
									defaultOutName: defaultOutName ?? null,
									defaultVideoImageFormat: null,
									defaultPixelFormat: null,
									defaultProResProfile: null,
								},
								folders: [],
							}}
						>
							<UpdateTime
								audioEnabled={audioEnabled}
								videoEnabled={videoEnabled}
								logLevel={logLevel}
								compId={id}
								initialFrame={initialFrame}
								timeUpdater={timeUpdater}
							>
								<Internals.CanUseRemotionHooks value>
									{/**
									 * @ts-expect-error	*/}
									<Component {...resolvedProps} />
								</Internals.CanUseRemotionHooks>
							</UpdateTime>
						</Internals.CompositionManager.Provider>
					</Internals.DelayRenderContextType.Provider>
				</Internals.RemotionEnvironmentContext>
			</Internals.MaxMediaCacheSizeContext.Provider>,
		);
	});

	resolve();
	await promise;

	return {
		delayRenderScope,
		div,
		cleanupScaffold: () => {
			root.unmount();
			div.remove();
		},
		timeUpdater,
	};
}
