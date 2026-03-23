import {createRef, type ComponentType} from 'react';
import {flushSync} from 'react-dom';
import ReactDOM from 'react-dom/client';
import type {Codec, DelayRenderScope, LogLevel, TRenderAsset} from 'remotion';
import {Internals} from 'remotion';
import type {$ZodObject} from 'zod/v4/core';
import type {TimeUpdaterRef} from './update-time';
import {UpdateTime} from './update-time';

export type ErrorHolder = {
	error: Error | null;
};

// React 19 currently reports this wrapper message through onUncaughtError()
// for some uncaught render failures. This string is not part of a public API,
// so keep this list in sync when upgrading React.
const GENERIC_REACT_RENDER_ERROR_MESSAGES = new Set([
	'Error thrown during rendering',
]);

const isMessageLikeObject = (
	err: unknown,
): err is {
	message: string;
} => {
	return (
		typeof err === 'object' &&
		err !== null &&
		'message' in err &&
		typeof err.message === 'string'
	);
};

const unknownErrorToMessage = (err: unknown): string => {
	if (typeof err === 'string') {
		return err;
	}

	if (isMessageLikeObject(err)) {
		return err.message;
	}

	try {
		const serialized = JSON.stringify(err);
		if (serialized) {
			return serialized;
		}
	} catch {
		// ignore
	}

	return String(err);
};

const setErrorCause = (error: Error, cause: unknown) => {
	try {
		Object.defineProperty(error, 'cause', {
			value: cause,
			enumerable: false,
			configurable: true,
			writable: true,
		});
	} catch {
		// ignore
	}
};

const appendComponentStack = (
	error: Error,
	componentStack: string | undefined,
): Error => {
	if (!componentStack?.trim()) {
		return error;
	}

	const normalizedComponentStack = componentStack.trim();
	const stack = error.stack ?? `${error.name}: ${error.message}`;
	if (stack.includes(normalizedComponentStack)) {
		return error;
	}

	const errorTitle = `${error.name}: ${error.message}`;
	const stackWithoutTitle = stack.startsWith(errorTitle)
		? stack.slice(errorTitle.length).trimStart()
		: stack;
	const stackBody =
		stackWithoutTitle.length > 0 ? `\n${stackWithoutTitle}` : '';
	error.stack = `${errorTitle}\nFor the likely root cause, see "React component stack:" after the JavaScript stack trace below.${stackBody}\nReact component stack:\n${normalizedComponentStack}`;
	return error;
};

const normalizeUncaughtReactError = (
	err: unknown,
	componentStack: string | undefined,
): Error => {
	if (err instanceof Error) {
		const {cause} = err;
		const shouldUnwrapCause =
			cause instanceof Error &&
			GENERIC_REACT_RENDER_ERROR_MESSAGES.has(err.message);

		// Only unwrap known generic wrappers so intentional custom wrappers can
		// still bubble up unchanged.
		const errorToThrow = shouldUnwrapCause ? cause : err;
		return appendComponentStack(errorToThrow, componentStack);
	}

	const normalized = new Error(unknownErrorToMessage(err));
	setErrorCause(normalized, err);
	return appendComponentStack(normalized, componentStack);
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
	schema: $ZodObject | null;
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

	const wrapper = document.createElement('div');
	wrapper.style.position = 'fixed';
	wrapper.style.inset = '0';
	wrapper.style.overflow = 'hidden';
	wrapper.style.visibility = 'hidden';
	wrapper.style.pointerEvents = 'none';
	wrapper.style.zIndex = '-9999';

	const div = document.createElement('div');

	div.style.position = 'absolute';
	div.style.top = '0';
	div.style.left = '0';
	div.style.display = 'flex';
	div.style.flexDirection = 'column';
	div.style.backgroundColor = 'transparent';
	div.style.width = `${width}px`;
	div.style.height = `${height}px`;

	const scaffoldClassName = `remotion-scaffold-${Math.random().toString(36).substring(2, 15)}`;
	div.className = scaffoldClassName;

	const cleanupCSS = Internals.CSSUtils.injectCSS(
		Internals.CSSUtils.makeDefaultPreviewCSS(`.${scaffoldClassName}`, 'white'),
	);

	wrapper.appendChild(div);
	document.body.appendChild(wrapper);

	const errorHolder: ErrorHolder = {error: null};

	const root = ReactDOM.createRoot(div, {
		onUncaughtError: (err, errorInfo) => {
			errorHolder.error = normalizeUncaughtReactError(
				err,
				errorInfo?.componentStack,
			);
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
										nonce: [[0, 0]],
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
			wrapper.remove();
			cleanupCSS();
		},
		timeUpdater,
		collectAssets,
	};
}
