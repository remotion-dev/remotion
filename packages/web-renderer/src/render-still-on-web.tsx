import {type ComponentType} from 'react';
import {flushSync} from 'react-dom';
import ReactDOM from 'react-dom/client';
import type {_InternalTypes, LogLevel} from 'remotion';
import {Internals} from 'remotion';
import type {AnyZodObject} from 'zod';
import type {PropsIfHasProps} from './props-if-has-props';
import {takeScreenshot} from './take-screenshot';
import {waitForReady} from './wait-for-ready';
import {withResolvers} from './with-resolvers';

type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);

type MandatoryRenderStillOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	component: LooseComponentType<Props>;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	frame: number;
} & PropsIfHasProps<Schema, Props>;

type OptionalRenderStillOnWebOptions<Schema extends AnyZodObject> = {
	delayRenderTimeoutInMilliseconds: number;
	logLevel: LogLevel;
	schema: Schema | undefined;
	id: string | null;
};

type InternalRenderStillOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderStillOnWebOptions<Schema, Props> &
	OptionalRenderStillOnWebOptions<Schema>;

export type RenderStillOnWebOptions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = MandatoryRenderStillOnWebOptions<Schema, Props> &
	Partial<OptionalRenderStillOnWebOptions<Schema>>;

async function internalRenderStillOnWeb<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>({
	component: Component,
	width,
	height,
	fps,
	durationInFrames,
	frame,
	delayRenderTimeoutInMilliseconds,
	logLevel,
	inputProps,
	id,
	schema,
}: InternalRenderStillOnWebOptions<Schema, Props>) {
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

	// TODO: calculateMetadata()
	// TODO: Video config

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

	const actualInputProps = inputProps ?? ({} as Props);

	const compId = id ?? 'default';

	flushSync(() => {
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
					<Internals.CompositionManager.Provider
						value={{
							compositions: [
								{
									id: compId,
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
								compositionId: compId,
							},
							currentCompositionMetadata: {
								props: inputProps ?? {},
								durationInFrames,
								fps,
								height,
								width,
								defaultCodec: null,
								defaultOutName: null,
								defaultVideoImageFormat: null,
								defaultPixelFormat: null,
								defaultProResProfile: null,
							},
							folders: [],
						}}
					>
						<Internals.RemotionRoot
							audioEnabled={false}
							videoEnabled
							logLevel={logLevel}
							numberOfAudioTags={0}
							audioLatencyHint="interactive"
							frameState={{
								[compId]: frame,
							}}
						>
							<Internals.CanUseRemotionHooks value>
								{/**
								 * @ts-expect-error	*/}
								<Component {...actualInputProps} />
							</Internals.CanUseRemotionHooks>
						</Internals.RemotionRoot>
					</Internals.CompositionManager.Provider>
				</Internals.DelayRenderContextType.Provider>
			</Internals.RemotionEnvironmentContext>,
		);
	});

	resolve();
	await promise;

	await waitForReady(delayRenderTimeoutInMilliseconds, delayRenderScope);

	const imageData = await takeScreenshot(div, width, height);

	root.unmount();
	div.remove();

	return imageData;
}

export const renderStillOnWeb = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>(
	options: RenderStillOnWebOptions<Schema, Props>,
) => {
	return internalRenderStillOnWeb<Schema, Props>({
		...options,
		delayRenderTimeoutInMilliseconds:
			options.delayRenderTimeoutInMilliseconds ?? 30000,
		logLevel: options.logLevel ?? 'info',
		schema: options.schema ?? undefined,
		id: options.id ?? null,
	});
};
