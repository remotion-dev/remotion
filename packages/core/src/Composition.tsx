import type {ComponentType} from 'react';
import React, {Suspense, useContext, useEffect} from 'react';
import {createPortal} from 'react-dom';
import type {AnyZodObject, z} from 'zod';
import {
	CanUseRemotionHooks,
	CanUseRemotionHooksProvider,
} from './CanUseRemotionHooks.js';
import {CompositionManager} from './CompositionManagerContext.js';
import {FolderContext} from './Folder.js';
import {useResolvedVideoConfig} from './ResolveCompositionConfig.js';
import type {Codec} from './codec.js';
import {continueRender, delayRender} from './delay-render.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import {serializeThenDeserializeInStudio} from './input-props-serialization.js';
import {useIsPlayer} from './is-player.js';
import {Loading} from './loading-indicator.js';
import {useNonce} from './nonce.js';
import {portalNode} from './portal-node.js';
import type {InferProps, PropsIfHasProps} from './props-if-has-props.js';
import {useLazyComponent} from './use-lazy-component.js';
import {useVideo} from './use-video.js';
import {validateCompositionId} from './validation/validate-composition-id.js';
import {validateDefaultAndInputProps} from './validation/validate-default-props.js';

type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);

export type CompProps<Props> =
	| {
			lazyComponent: () => Promise<{default: LooseComponentType<Props>}>;
	  }
	| {
			component: LooseComponentType<Props>;
	  };

export type CalcMetadataReturnType<T extends Record<string, unknown>> = {
	durationInFrames?: number;
	fps?: number;
	width?: number;
	height?: number;
	props?: T;
	defaultCodec?: Codec;
	defaultOutName?: string;
};

export type CalculateMetadataFunction<T extends Record<string, unknown>> =
	(options: {
		defaultProps: T;
		props: T;
		abortSignal: AbortSignal;
		compositionId: string;
	}) => Promise<CalcMetadataReturnType<T>> | CalcMetadataReturnType<T>;

type OptionalDimensions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	width?: number;
	height?: number;
	calculateMetadata: CalculateMetadataFunction<InferProps<Schema, Props>>;
};

type MandatoryDimensions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	width: number;
	height: number;
	calculateMetadata?: CalculateMetadataFunction<InferProps<Schema, Props>>;
};

type StillCalculateMetadataOrExplicit<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = OptionalDimensions<Schema, Props> | MandatoryDimensions<Schema, Props>;

type CompositionCalculateMetadataOrExplicit<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> =
	| (OptionalDimensions<Schema, Props> & {
			fps?: number;
			durationInFrames?: number;
	  })
	| (MandatoryDimensions<Schema, Props> & {
			fps: number;
			durationInFrames: number;
	  });

export type StillProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	id: string;
	schema?: Schema;
} & StillCalculateMetadataOrExplicit<Schema, Props> &
	CompProps<Props> &
	PropsIfHasProps<Schema, Props>;

export type CompositionProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	readonly id: string;
	readonly schema?: Schema;
} & CompositionCalculateMetadataOrExplicit<Schema, Props> &
	CompProps<Props> &
	PropsIfHasProps<Schema, Props>;

const Fallback: React.FC = () => {
	useEffect(() => {
		const fallback = delayRender('Waiting for Root component to unsuspend');
		return () => continueRender(fallback);
	}, []);
	return null;
};

/*
 * @description This component is used to register a video to make it renderable and make it show in the sidebar, in dev mode.
 * @see [Documentation](https://remotion.dev/docs/composition)
 */
export const Composition = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
>({
	width,
	height,
	fps,
	durationInFrames,
	id,
	defaultProps,
	schema,
	...compProps
}: CompositionProps<Schema, Props>) => {
	const {registerComposition, unregisterComposition} =
		useContext(CompositionManager);
	const video = useVideo();

	const lazy = useLazyComponent<Props>({
		compProps: compProps as CompProps<Props>,
		componentName: 'Composition',
		noSuspense: false,
	});
	const nonce = useNonce();
	const isPlayer = useIsPlayer();
	const environment = getRemotionEnvironment();

	const canUseComposition = useContext(CanUseRemotionHooks);
	if (canUseComposition) {
		if (isPlayer) {
			throw new Error(
				'<Composition> was mounted inside the `component` that was passed to the <Player>. See https://remotion.dev/docs/wrong-composition-mount for help.',
			);
		}

		throw new Error(
			'<Composition> mounted inside another composition. See https://remotion.dev/docs/wrong-composition-mount for help.',
		);
	}

	const {folderName, parentName} = useContext(FolderContext);

	useEffect(() => {
		// Ensure it's a URL safe id
		if (!id) {
			throw new Error('No id for composition passed.');
		}

		validateCompositionId(id);
		validateDefaultAndInputProps(defaultProps, 'defaultProps', id);
		registerComposition<Schema, Props>({
			durationInFrames: durationInFrames ?? undefined,
			fps: fps ?? undefined,
			height: height ?? undefined,
			width: width ?? undefined,
			id,
			folderName,
			component: lazy,
			defaultProps: serializeThenDeserializeInStudio(
				(defaultProps ?? {}) as z.output<Schema> & Props,
			) as z.output<Schema> & Props,
			nonce,
			parentFolderName: parentName,
			schema: schema ?? null,
			calculateMetadata: compProps.calculateMetadata ?? null,
		});

		return () => {
			unregisterComposition(id);
		};
	}, [
		durationInFrames,
		fps,
		height,
		lazy,
		id,
		folderName,
		defaultProps,
		registerComposition,
		unregisterComposition,
		width,
		nonce,
		parentName,
		schema,
		compProps.calculateMetadata,
	]);
	const resolved = useResolvedVideoConfig(id);

	if (environment.isStudio && video && video.component === lazy) {
		const Comp = lazy;
		if (resolved === null || resolved.type !== 'success') {
			return null;
		}

		return createPortal(
			<CanUseRemotionHooksProvider>
				<Suspense fallback={<Loading />}>
					<Comp
						{
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							...((resolved.result.props ?? {}) as any)
						}
					/>
				</Suspense>
			</CanUseRemotionHooksProvider>,
			portalNode(),
		);
	}

	if (environment.isRendering && video && video.component === lazy) {
		const Comp = lazy;
		if (resolved === null || resolved.type !== 'success') {
			return null;
		}

		return createPortal(
			<CanUseRemotionHooksProvider>
				<Suspense fallback={<Fallback />}>
					<Comp
						{
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							...((resolved.result.props ?? {}) as any)
						}
					/>
				</Suspense>
			</CanUseRemotionHooksProvider>,
			portalNode(),
		);
	}

	return null;
};
