import type {ComponentType, PropsWithChildren} from 'react';
import React, {Suspense, useContext, useEffect, useMemo} from 'react';
import {createPortal} from 'react-dom';
import {z} from 'zod';
import {AbsoluteFill} from './AbsoluteFill.js';
import {CanUseRemotionHooksProvider} from './CanUseRemotionHooks.js';
import {CompositionManager} from './CompositionManager.js';
import {getInputProps} from './config/input-props.js';
import {continueRender, delayRender} from './delay-render.js';
import {FolderContext} from './Folder.js';
import {useRemotionEnvironment} from './get-environment.js';
import {Internals} from './internals.js';
import {Loading} from './loading-indicator.js';
import {NativeLayersContext} from './NativeLayers.js';
import {useNonce} from './nonce.js';
import {portalNode} from './portal-node.js';
import type {PropsIfHasProps} from './props-if-has-props.js';
import {useLazyComponent} from './use-lazy-component.js';
import {useVideo} from './use-video.js';
import {validateCompositionId} from './validation/validate-composition-id.js';
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

export type StillProps<Schema extends z.ZodTypeAny, Props> = {
	width: number;
	height: number;
	id: string;
	schema?: Schema;
} & CompProps<Props> &
	PropsIfHasProps<Schema, Props>;

export type CompositionProps<Schema extends z.ZodTypeAny, Props> = StillProps<
	Schema,
	Props
> & {
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

export const Composition = <Schema extends z.ZodTypeAny, Props>({
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

	const canUseComposition = useContext(Internals.CanUseRemotionHooks);
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
			schema: schema ?? (z.any() as unknown as Schema),
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
	]);

	if (environment === 'preview' && video && video.component === lazy) {
		const Comp = lazy;
		const inputProps = getInputProps();

		return createPortal(
			<ClipComposition>
				<CanUseRemotionHooksProvider>
					<Suspense fallback={<Loading />}>
						<Comp {...defaultProps} {...inputProps} />
					</Suspense>
				</CanUseRemotionHooksProvider>
			</ClipComposition>,

			portalNode()
		);
	}

	if (environment === 'rendering' && video && video.component === lazy) {
		const Comp = lazy;
		const inputProps = getInputProps();

		return createPortal(
			<CanUseRemotionHooksProvider>
				<Suspense fallback={<Fallback />}>
					<Comp {...defaultProps} {...inputProps} />
				</Suspense>
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
