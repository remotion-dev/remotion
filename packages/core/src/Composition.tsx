import type {ComponentType, PropsWithChildren} from 'react';
import React, {Suspense, useContext, useEffect, useMemo} from 'react';
import {createPortal} from 'react-dom';
import type {AnyZodObject, z} from 'zod';
import {AbsoluteFill} from './AbsoluteFill.js';
import {
	CanUseRemotionHooks,
	CanUseRemotionHooksProvider,
} from './CanUseRemotionHooks.js';
import {CompositionManager} from './CompositionManagerContext.js';
import {continueRender, delayRender} from './delay-render.js';
import {FolderContext} from './Folder.js';
import {useRemotionEnvironment} from './get-environment.js';
import {Loading} from './loading-indicator.js';
import {NativeLayersContext} from './NativeLayers.js';
import {useNonce} from './nonce.js';
import {portalNode} from './portal-node.js';
import type {InferProps, PropsIfHasProps} from './props-if-has-props.js';
import {useResolvedVideoConfig} from './ResolveCompositionConfig.js';
import {useLazyComponent} from './use-lazy-component.js';
import {useVideo} from './use-video.js';
import {validateCompositionId} from './validation/validate-composition-id.js';
import {validateDefaultAndInputProps} from './validation/validate-default-props.js';
import {validateDimension} from './validation/validate-dimensions.js';
import {validateDurationInFrames} from './validation/validate-duration-in-frames.js';
import {validateFps} from './validation/validate-fps.js';

type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);

export type CompProps<Props> =
	| {
			lazyComponent: () => Promise<{default: LooseComponentType<Props>}>;
	  }
	| {
			component: LooseComponentType<Props>;
	  };

export type CalcMetadataReturnType<T> = {
	durationInFrames?: number;
	fps?: number;
	width?: number;
	height?: number;
	props?: T;
};

export type CalculateMetadataFunction<T> = (options: {
	defaultProps: T;
	props: T;
	abortSignal: AbortSignal;
}) => Promise<CalcMetadataReturnType<T>> | CalcMetadataReturnType<T>;

export type StillProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown> | undefined
> = {
	width: number;
	height: number;
	id: string;
	calculateMetadata?: CalculateMetadataFunction<InferProps<Schema, Props>>;
	schema?: Schema;
} & CompProps<Props> &
	PropsIfHasProps<Schema, Props>;

export type CompositionProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown> | undefined
> = StillProps<Schema, Props> & {
	fps: number;
	durationInFrames: number;
};

const Fallback: React.FC = () => {
	useEffect(() => {
		const fallback = delayRender('Waiting for Root component to unsuspend');
		return () => continueRender(fallback);
	}, []);
	return null;
};

/**
 * @description This component is used to register a video to make it renderable and make it show in the sidebar, in dev mode.
 * @see [Documentation](https://www.remotion.dev/docs/composition)
 */

export const Composition = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown> | undefined
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

	const lazy = useLazyComponent<Props>(compProps as CompProps<Props>);
	const nonce = useNonce();
	const environment = useRemotionEnvironment();

	const canUseComposition = useContext(CanUseRemotionHooks);
	if (canUseComposition) {
		if (
			environment === 'player-development' ||
			environment === 'player-production'
		) {
			throw new Error(
				'<Composition> was mounted inside the `component` that was passed to the <Player>. See https://remotion.dev/docs/wrong-composition-mount for help.'
			);
		}

		throw new Error(
			'<Composition> mounted inside another composition. See https://remotion.dev/docs/wrong-composition-mount for help.'
		);
	}

	const {folderName, parentName} = useContext(FolderContext);

	useEffect(() => {
		// Ensure it's a URL safe id
		if (!id) {
			throw new Error('No id for composition passed.');
		}

		validateCompositionId(id);
		validateDimension(width, 'width', 'of the <Composition/> component');
		validateDimension(height, 'height', 'of the <Composition/> component');
		validateDurationInFrames({
			durationInFrames,
			component: 'of the <Composition/> component',
			allowFloats: false,
		});

		validateFps(fps, 'as a prop of the <Composition/> component', false);
		validateDefaultAndInputProps(defaultProps, 'defaultProps', id);
		registerComposition<Schema, Props>({
			durationInFrames,
			fps,
			height,
			width,
			id,
			folderName,
			component: lazy,
			defaultProps: defaultProps as z.infer<Schema> & Props,
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

	if (environment === 'preview' && video && video.component === lazy) {
		const Comp = lazy;
		if (resolved === null || resolved.type !== 'success') {
			return null;
		}

		return createPortal(
			<ClipComposition>
				<CanUseRemotionHooksProvider>
					<Suspense fallback={<Loading />}>
						<Comp
							{
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								...((resolved.result.defaultProps ?? {}) as any)
							}
						/>
					</Suspense>
				</CanUseRemotionHooksProvider>
			</ClipComposition>,
			portalNode()
		);
	}

	if (environment === 'rendering' && video && video.component === lazy) {
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
							...((resolved.result.defaultProps ?? {}) as any)
						}
					/>
				</Suspense>
			</CanUseRemotionHooksProvider>,
			portalNode()
		);
	}

	return null;
};

const ClipComposition: React.FC<PropsWithChildren> = ({children}) => {
	const {clipRegion} = useContext(NativeLayersContext);
	const style: React.CSSProperties = useMemo(() => {
		return {
			display: 'flex',
			flexDirection: 'row',
			opacity: clipRegion === 'hide' ? 0 : 1,
			clipPath:
				clipRegion && clipRegion !== 'hide'
					? `polygon(${clipRegion.x}px ${clipRegion.y}px, ${clipRegion.x}px ${
							clipRegion.height + clipRegion.y
					  }px, ${clipRegion.width + clipRegion.x}px ${
							clipRegion.height + clipRegion.y
					  }px, ${clipRegion.width + clipRegion.x}px ${clipRegion.y}px)`
					: undefined,
		};
	}, [clipRegion]);

	return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};
