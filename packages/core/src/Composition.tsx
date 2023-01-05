import type {ComponentType, PropsWithChildren} from 'react';
import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import {createPortal} from 'react-dom';
import {AbsoluteFill} from './AbsoluteFill';
import {CanUseRemotionHooksProvider} from './CanUseRemotionHooks';
import {CompositionManager} from './CompositionManager';
import {getInputProps} from './config/input-props';
import {continueRender, delayRender} from './delay-render';
import {FolderContext} from './Folder';
import {getRemotionEnvironment} from './get-environment';
import {Internals} from './internals';
import type {Layer, LooseComponentType} from './LayerMaster';
import {LayerMaster} from './LayerMaster';
import {Loading} from './loading-indicator';
import {NativeLayersContext} from './NativeLayers';
import {useNonce} from './nonce';
import {portalNode} from './portal-node';
import {useVideo} from './use-video';
import {validateCompositionId} from './validation/validate-composition-id';
import {validateDimension} from './validation/validate-dimensions';
import {validateDurationInFrames} from './validation/validate-duration-in-frames';
import {validateFps} from './validation/validate-fps';

export type CompProps<T> =
	| {
			lazyComponent: () => Promise<{default: LooseComponentType<T>}>;
	  }
	| {
			component: LooseComponentType<T>;
	  }
	| {
			layers: Layer<T>[];
	  };

const Fallback: React.FC = () => {
	useEffect(() => {
		const fallback = delayRender('Waiting for Root component to unsuspend');
		return () => continueRender(fallback);
	}, []);
	return null;
};

export const convertComponentTypesToLayers = <T,>(
	compProps: CompProps<T>
): Layer<T>[] => {
	if ('component' in compProps) {
		// In SSR, suspense is not yet supported, we cannot use React.lazy
		if (typeof document === 'undefined') {
			return [
				{
					component:
						compProps.component as unknown as React.LazyExoticComponent<
							ComponentType<T>
						>,
					type: 'web',
				},
			];
		}

		return [
			{
				component: React.lazy(() =>
					Promise.resolve({default: compProps.component as ComponentType<T>})
				),
				type: 'web',
			},
		];
	}

	if ('lazyComponent' in compProps) {
		return [
			{
				component: React.lazy(
					compProps.lazyComponent as () => Promise<{
						default: ComponentType<T>;
					}>
				),
				type: 'web',
			},
		];
	}

	if ('layers' in compProps) {
		return compProps.layers;
	}

	throw new Error('Unknown component type');
};

export const convertComponentTypesToLayersWithCache = <T,>(
	compProps: CompProps<T>,
	prevCompProps: CompProps<T> | null,
	prevReturnValue: Layer<T>[] | null
): Layer<T>[] => {
	if ('component' in compProps) {
		if (
			prevCompProps &&
			'component' in prevCompProps &&
			compProps.component === prevCompProps.component &&
			prevReturnValue
		) {
			return prevReturnValue;
		}

		return [
			{
				type: 'web',
				component: React.lazy(() =>
					Promise.resolve({default: compProps.component as ComponentType<T>})
				),
			},
		];
	}

	if ('lazyComponent' in compProps) {
		if (
			prevCompProps &&
			'lazyComponent' in prevCompProps &&
			compProps.lazyComponent === prevCompProps.lazyComponent &&
			prevReturnValue
		) {
			return prevReturnValue;
		}

		return [
			{
				type: 'web',
				component: React.lazy(
					compProps.lazyComponent as () => Promise<{
						default: ComponentType<T>;
					}>
				),
			},
		];
	}

	if ('layers' in compProps) {
		const isTheSame = () => {
			if (!prevCompProps) {
				return false;
			}

			if (!('layers' in prevCompProps)) {
				return false;
			}

			if (compProps.layers.length !== prevCompProps.layers.length) {
				return false;
			}

			for (let i = 0; i < compProps.layers.length; i++) {
				if (
					compProps.layers[i].component !== prevCompProps.layers[i].component
				) {
					return false;
				}

				if (compProps.layers[i].type !== prevCompProps.layers[i].type) {
					return false;
				}
			}

			return true;
		};

		if (isTheSame()) {
			return prevReturnValue as Layer<T>[];
		}

		const newComp = compProps.layers;

		return newComp;
	}

	throw new Error('Unknown component type');
};

export type StillProps<T> = {
	width: number;
	height: number;
	id: string;
	defaultProps?: T;
} & CompProps<T>;

type CompositionProps<T> = StillProps<T> & {
	fps: number;
	durationInFrames: number;
};

const GetCompositionsFromMarkupMode = createContext(false);

export const GetCompositionsFromMarkupModeProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	return (
		<GetCompositionsFromMarkupMode.Provider value>
			{children}
		</GetCompositionsFromMarkupMode.Provider>
	);
};

export const Composition = <T extends object>({
	width,
	height,
	fps,
	durationInFrames,
	id,
	defaultProps,
	...compProps
}: CompositionProps<T>) => {
	const {registerComposition, unregisterComposition} =
		useContext(CompositionManager);
	const video = useVideo();

	const prevCompProps = useRef<typeof compProps>();
	const prevLayers = useRef<Layer<T>[]>();
	const layers = convertComponentTypesToLayersWithCache(
		compProps,
		prevCompProps.current ?? null,
		prevLayers.current ?? null
	);
	prevCompProps.current = compProps;
	prevLayers.current = layers;

	const nonce = useNonce();

	const isInGetCompositionsFromMarkupMode = useContext(
		GetCompositionsFromMarkupMode
	);

	const canUseComposition = useContext(Internals.CanUseRemotionHooks);
	if (canUseComposition) {
		if (typeof window !== 'undefined' && window.remotion_isPlayer) {
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
		validateDurationInFrames(
			durationInFrames,
			'of the <Composition/> component'
		);

		validateFps(fps, 'as a prop of the <Composition/> component', false);
		registerComposition<T>({
			durationInFrames,
			fps,
			height,
			width,
			id,
			folderName,
			defaultProps,
			nonce,
			parentFolderName: parentName,
			layers,
		});

		return () => {
			unregisterComposition(id);
		};
	}, [
		durationInFrames,
		fps,
		height,
		id,
		folderName,
		defaultProps,
		registerComposition,
		unregisterComposition,
		width,
		nonce,
		parentName,
		compProps,
		layers,
	]);

	if (getRemotionEnvironment() === 'server-rendering') {
		if (isInGetCompositionsFromMarkupMode) {
			return (
				<div
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							width,
							height,
							fps,
							durationInFrames,
							id,
						}),
					}}
				/>
			);
		}

		if (process.env.SELECT_COMP_ID === id) {
			// @ts-expect-error
			const Comp = compProps.component as ComponentType;
			const inputProps = getInputProps();

			// TODO: input props
			return (
				<CanUseRemotionHooksProvider>
					<Comp {...defaultProps} {...inputProps} />
				</CanUseRemotionHooksProvider>
			);
		}

		// TODO: Unset env variables
		if (process.env.SELECT_COMP_ID) {
			return null;
		}

		throw new Error('unexpected state in server rendering');
	}

	if (getRemotionEnvironment() === 'preview' && video && video.id === id) {
		const inputProps = getInputProps();

		return createPortal(
			<ClipComposition>
				<CanUseRemotionHooksProvider>
					<LayerMaster<T>
						layers={layers}
						defaultProps={defaultProps}
						inputProps={inputProps}
						fallbackComponent={Loading}
					/>
				</CanUseRemotionHooksProvider>
			</ClipComposition>,
			portalNode()
		);
	}

	if (getRemotionEnvironment() === 'rendering' && video && video.id === id) {
		const inputProps = getInputProps();

		return createPortal(
			<CanUseRemotionHooksProvider>
				<LayerMaster<T>
					layers={layers}
					defaultProps={defaultProps}
					inputProps={inputProps}
					fallbackComponent={Fallback}
				/>
			</CanUseRemotionHooksProvider>,
			portalNode()
		);
	}

	return null;
};

export const ClipComposition: React.FC<PropsWithChildren> = ({children}) => {
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
