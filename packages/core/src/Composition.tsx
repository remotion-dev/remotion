import type {ComponentType, PropsWithChildren} from 'react';
import React, {createContext, useContext, useEffect, useMemo} from 'react';
import {createPortal} from 'react-dom';
import {AbsoluteFill} from './AbsoluteFill';
import {CanUseRemotionHooksProvider} from './CanUseRemotionHooks';
import type {TCompMetadata} from './CompositionManager';
import {CompositionManager} from './CompositionManager';
import {getInputProps} from './config/input-props';
import {continueRender, delayRender} from './delay-render';
import {FolderContext} from './Folder';
import {getRemotionEnvironment} from './get-environment';
import {Internals} from './internals';
import {LayerMaster} from './LayerMaster';
import type {CompProps} from './layers';
import {useLayers} from './layers';
import {Loading} from './loading-indicator';
import {NativeLayersContext} from './NativeLayers';
import {useNonce} from './nonce';
import {portalNode} from './portal-node';
import {useVideo} from './use-video';
import {validateCompositionId} from './validation/validate-composition-id';
import {validateDimension} from './validation/validate-dimensions';
import {validateDurationInFrames} from './validation/validate-duration-in-frames';
import {validateFps} from './validation/validate-fps';

const Fallback: React.FC = () => {
	useEffect(() => {
		const fallback = delayRender('Waiting for Root component to unsuspend');
		return () => continueRender(fallback);
	}, []);
	return null;
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

type CompositionMode =
	| {
			type: 'none';
	  }
	| {
			type: 'compositions';
	  }
	| {
			type: 'selected';
			id: string;
	  };

const compMode: CompositionMode = {
	type: 'compositions',
};

const GetCompositionsFromMarkupMode = createContext<CompositionMode>({
	type: 'none',
});

export const GetCompositionsFromMarkupModeProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	return (
		<GetCompositionsFromMarkupMode.Provider value={compMode}>
			{children}
		</GetCompositionsFromMarkupMode.Provider>
	);
};

export const SelectCompositionMode: React.FC<{
	children: React.ReactNode;
	id: string;
}> = ({children, id}) => {
	const mode = useMemo((): CompositionMode => {
		return {
			type: 'selected',
			id,
		};
	}, [id]);

	return (
		<GetCompositionsFromMarkupMode.Provider value={mode}>
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
	const layers = useLayers(compProps);

	const nonce = useNonce();

	const getCompositionsContext = useContext(GetCompositionsFromMarkupMode);
	const isInGetCompositionsFromMarkupMode =
		getCompositionsContext.type === 'compositions';

	const isInSelectMode = getCompositionsContext.type === 'selected';

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
		layers,
	]);

	if (getRemotionEnvironment() === 'server-rendering') {
		if (isInGetCompositionsFromMarkupMode) {
			const metadata = {
				width,
				height,
				fps,
				durationInFrames,
				id,
				defaultProps,
				layers,
			} as TCompMetadata;
			return (
				<div
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(metadata),
					}}
				/>
			);
		}

		if (isInSelectMode && video?.id === getCompositionsContext.id) {
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
