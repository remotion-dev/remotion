import type {ComponentType, PropsWithChildren} from 'react';
import React, {Suspense, useContext, useEffect, useMemo} from 'react';
import {createPortal} from 'react-dom';
import {AbsoluteFill} from './AbsoluteFill';
import {CanUseRemotionHooksProvider} from './CanUseRemotionHooks';
import {CompositionManager} from './CompositionManager';
import {getInputProps} from './config/input-props';
import {continueRender, delayRender} from './delay-render';
import {FolderContext} from './Folder';
import {useRemotionEnvironment} from './get-environment';
import {Internals} from './internals';
import {Loading} from './loading-indicator';
import {NativeLayersContext} from './NativeLayers';
import {useNonce} from './nonce';
import {portalNode} from './portal-node';
import {useLazyComponent} from './use-lazy-component';
import {useVideo} from './use-video';
import {validateCompositionId} from './validation/validate-composition-id';
import {validateDimension} from './validation/validate-dimensions';
import {validateDurationInFrames} from './validation/validate-duration-in-frames';
import {validateFps} from './validation/validate-fps';

type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);

export type CompProps<T> =
	| {
			lazyComponent: () => Promise<{default: LooseComponentType<T>}>;
	  }
	| {
			component: LooseComponentType<T>;
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

const Fallback: React.FC = () => {
	useEffect(() => {
		const fallback = delayRender('Waiting for Root component to unsuspend');
		return () => continueRender(fallback);
	}, []);
	return null;
};

export const Composition = <T,>({
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

	const lazy = useLazyComponent(compProps);
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
			component: lazy,
			defaultProps,
			nonce,
			parentFolderName: parentName,
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
