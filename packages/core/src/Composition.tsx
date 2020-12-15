import React, {ComponentType, useContext, useEffect, useMemo} from 'react';
import {CompositionManager} from './CompositionManager';
import {
	addStaticComposition,
	getShouldStaticallyReturnCompositions,
} from './register-root';

type CompProps<T> =
	| {
			lazyComponent: () => Promise<{default: ComponentType<T>}>;
	  }
	| {
			component: ComponentType<T>;
	  };

type Props<T> = {
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	name: string;
	props?: T;
} & CompProps<T>;

export const Composition = <T,>({
	width,
	height,
	fps,
	durationInFrames,
	name,
	props,
	...compProps
}: Props<T>) => {
	const {registerComposition, unregisterComposition} = useContext(
		CompositionManager
	);

	const lazy = useMemo(() => {
		if ('lazyComponent' in compProps) {
			return React.lazy(compProps.lazyComponent);
		}
		if ('component' in compProps) {
			return React.lazy(() => Promise.resolve({default: compProps.component}));
		}
		throw new Error("You must pass either 'component' or lazy compoentn");
		// eslint-disable-next-line react-hooks/exhaustive-deps
		// @ts-expect-error
	}, [compProps.lazyComponent, compProps.component]);

	useEffect(() => {
		// Ensure it's a URL safe name
		if (!name) {
			throw new Error('No name for composition passed.');
		}
		if (!name.match(/^([a-zA-Z0-9-])+$/g)) {
			throw new Error(
				`Composition name can only contain a-z, A-Z, 0-9 and -. You passed ${name}`
			);
		}
		registerComposition<T>({
			durationInFrames,
			fps,
			height,
			width,
			name,
			component: lazy,
			props,
		});

		return () => {
			unregisterComposition(name);
		};
	}, [
		durationInFrames,
		fps,
		height,
		lazy,
		name,
		props,
		registerComposition,
		unregisterComposition,
		width,
	]);
	if (getShouldStaticallyReturnCompositions()) {
		addStaticComposition({
			component: lazy,
			durationInFrames,
			fps,
			height,
			name,
			width,
		});
	}

	return null;
};
