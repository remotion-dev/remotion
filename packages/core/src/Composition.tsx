import React, {ComponentType, useContext, useEffect, useMemo} from 'react';
import {CompositionManager} from './CompositionManager';
import {useNonce} from './nonce';
import {
	addStaticComposition,
	getIsEvaluation,
	removeStaticComposition,
} from './register-root';
import {validateDurationInFrames} from './validation/validate-duration-in-frames';
import {validateFps} from './validation/validate-fps';

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

export const Composition = <T, >({
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

	const nonce = useNonce();

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

		if (typeof width !== 'number') {
			throw new Error(
				`The "width" of a composition must be a number, but you passed a ${typeof width}`
			);
		}

		if (width <= 0) {
			throw new TypeError(
				`The "width" of a composition must be positive, but got ${width}.`
			);
		}

		if (typeof height !== 'number') {
			throw new Error(
				`The "height" of a composition must be a number, but you passed a ${typeof height}`
			);
		}

		if (height <= 0) {
			throw new TypeError(
				`The "height" of a composition must be positive, but got ${height}.`
			);
		}

		validateDurationInFrames(durationInFrames);
		validateFps(fps);
		registerComposition<T>({
			durationInFrames,
			fps,
			height,
			width,
			id,
			component: lazy,
			props,
			nonce,
		});

		if (getIsEvaluation()) {
			addStaticComposition({
				component: lazy,
				durationInFrames,
				fps,
				height,
				id,
				width,
				nonce,
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
		nonce,
	]);

	return null;
};
