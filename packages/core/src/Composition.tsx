import React, {ComponentType, useContext, useEffect, useMemo} from 'react';
import {CompositionManager} from './CompositionManager';
import {
	addStaticComposition,
	getIsEvaluation,
	removeStaticComposition,
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
	id: string;
	defaultProps?: T;
} & CompProps<T>;

export const Composition = <T,>({
	width,
	height,
	fps,
	durationInFrames,
	id,
	defaultProps: props,
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
		throw new Error("You must pass either 'component' or 'lazyComponent'");
		// @ts-expect-error
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [compProps.lazyComponent, compProps.component]);

	useEffect(() => {
		// Ensure it's a URL safe id
		if (!id) {
			throw new Error('No id for composition passed.');
		}
		if (!id.match(/^([a-zA-Z0-9-])+$/g)) {
			throw new Error(
				`Composition id can only contain a-z, A-Z, 0-9 and -. You passed ${id}`
			);
		}
		registerComposition<T>({
			durationInFrames,
			fps,
			height,
			width,
			id,
			component: lazy,
			props,
		});

		if (getIsEvaluation()) {
			addStaticComposition({
				component: lazy,
				durationInFrames,
				fps,
				height,
				id,
				width,
			});
		}

		return () => {
			unregisterComposition(id);
			removeStaticComposition(id);
		};
	}, [
		durationInFrames,
		fps,
		height,
		lazy,
		id,
		props,
		registerComposition,
		unregisterComposition,
		width,
	]);

	return null;
};
