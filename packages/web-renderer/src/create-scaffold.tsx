import {createRef, type ComponentType} from 'react';
import {flushSync} from 'react-dom';
import ReactDOM from 'react-dom/client';
import type {Codec, DelayRenderScope, LogLevel, TRenderAsset} from 'remotion';
import {Internals} from 'remotion';
import type {AnyZodObject} from 'zod';
import type {TimeUpdaterRef} from './update-time';
import {UpdateTime} from './update-time';

export type ErrorHolder = {
	error: Error | null;
};

export function checkForError(errorHolder: ErrorHolder): void {
	if (errorHolder.error) {
		throw errorHolder.error;
	}
}

export function createScaffold<Props extends Record<string, unknown>>({
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
}): {
	delayRenderScope: DelayRenderScope;
	div: HTMLDivElement;
	timeUpdater: React.RefObject<TimeUpdaterRef | null>;
	collectAssets: React.RefObject<{
		collectAssets: () => TRenderAsset[];
	} | null>;
	errorHolder: ErrorHolder;
	[Symbol.dispose]: () => void;
} {
	if (!ReactDOM.createRoot) {
		throw new Error('@remotion/web-renderer requires React 18 or higher');
	}

	const div = document.createElement('div');

	// Match same behavior as in portal-node.ts
	div.style.position = 'fixed';
	div.style.display = 'flex';
	div.style.flexDirection = 'column';
	div.style.backgroundColor = 'transparent';
	div.style.width = `${width}px`;
	div.style.height = `${height}px`;
	div.style.zIndex = '-9999';
	div.style.top = '0';
	div.style.left = '0';
	div.style.right = '0';
	div.style.bottom = '0';
	div.style.visibility = 'hidden';
	div.style.pointerEvents = 'none';

	const scaffoldClassName = `remotion-scaffold-${Math.random().toString(36).substring(2, 15)}`;
	div.className = scaffoldClassName;

	const cleanupCSS = Internals.CSSUtils.injectCSS(
		Internals.CSSUtils.makeDefaultPreviewCSS(`.${scaffoldClassName}`, 'white'),
	);

	document.body.appendChild(div);

	const errorHolder: ErrorHolder = {error: null};

	const root = ReactDOM.createRoot(div, {
		onUncaughtError: (err) => {
			errorHolder.error = err instanceof Error ? err : new Error(String(err));
		},
	});

	const delayRenderScope: DelayRenderScope = {
		remotion_renderReady: true,
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: delayRenderTimeoutInMilliseconds,
		remotion_attempt: 0,
		remotion_delayRenderHandles: [],
	};

	const timeUpdater = createRef<TimeUpdaterRef | null>();

	const collectAssets = createRef<{
		collectAssets: () => TRenderAsset[];
	}>();

	flushSync(() => {
		root.render(
			<Internals.MaxMediaCacheSizeContext.Provider
				value={mediaCacheSizeInBytes}
			>
				<Internals.RemotionEnvironmentContext.Provider
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
							<Internals.RenderAssetManagerProvider
								collectAssets={collectAssets}
							>
								<UpdateTime
									audioEnabled={audioEnabled}
									videoEnabled={videoEnabled}
									logLevel={logLevel}
									compId={id}
									initialFrame={initialFrame}
									timeUpdater={timeUpdater}
								>
									<Internals.CanUseRemotionHooks.Provider value>
										{/**
										 * @ts-expect-error	*/}
										<Component {...resolvedProps} />
									</Internals.CanUseRemotionHooks.Provider>
								</UpdateTime>
							</Internals.RenderAssetManagerProvider>
						</Internals.CompositionManager.Provider>
					</Internals.DelayRenderContextType.Provider>
				</Internals.RemotionEnvironmentContext.Provider>
			</Internals.MaxMediaCacheSizeContext.Provider>,
		);
	});

	return {
		delayRenderScope,
		div,
		errorHolder,
		[Symbol.dispose]: () => {
			root.unmount();
			div.remove();
			cleanupCSS();
		},
		timeUpdater,
		collectAssets,
	};
}
