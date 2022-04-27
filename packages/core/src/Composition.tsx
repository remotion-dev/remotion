import {createContext, FC, useContext, useEffect, useMemo} from 'react';
import React, {ComponentType} from 'react';
import {CompositionManager} from './CompositionManager';
import {useNonce} from './nonce';

import {useLazyComponent} from './use-lazy-component';
import {validateCompositionId} from './validation/validate-composition-id';
import {validateDimension} from './validation/validate-dimensions';
import {validateDurationInFrames} from './validation/validate-duration-in-frames';
import {validateFps} from './validation/validate-fps';
import {validateFolderName} from './validation/validate-folder-name';

const FolderContext = createContext<{folderName: string | null}>({
	folderName: null,
});

export const Folder: FC<{name: string; children: React.ReactNode}> = ({
	name,
	children,
}) => {
	const value = useMemo(() => {
		return {folderName: name};
	}, [name]);

	return (
		<FolderContext.Provider value={value}>{children}</FolderContext.Provider>
	);
};

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

	const lazy = useLazyComponent(compProps);
	const nonce = useNonce();

	const {folderName} = useContext(FolderContext);

	useEffect(() => {
		// Ensure it's a URL safe id
		if (!id) {
			throw new Error('No id for composition passed.');
		}

		validateCompositionId(id);
		// TODO
		// validateFolderName(folderName);
		validateDimension(width, 'width', 'of the <Composition/> component');
		validateDimension(height, 'height', 'of the <Composition/> component');
		validateDurationInFrames(
			durationInFrames,
			'of the <Composition/> component'
		);
		if (folderName) {
			validateFolderName(folderName);
		}
		validateFps(fps, 'as a prop of the <Composition/> component');
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
	]);

	return null;
};
