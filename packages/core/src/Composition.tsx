import {ComponentType, useContext, useEffect} from 'react';
import {CompositionManager} from './CompositionManager';
import {
	addStaticComposition,
	getShouldStaticallyReturnCompositions,
} from './register-root';

type Props<T> = {
	component: ComponentType<T>;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	name: string;
	props?: T;
};

export const Composition = <T,>({
	component,
	width,
	height,
	fps,
	durationInFrames,
	name,
	props,
}: Props<T>) => {
	const {registerComposition, unregisterComposition} = useContext(
		CompositionManager
	);

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
			component,
			props,
		});

		return () => {
			unregisterComposition(name);
		};
	}, [
		component,
		durationInFrames,
		fps,
		height,
		name,
		props,
		registerComposition,
		unregisterComposition,
		width,
	]);
	if (getShouldStaticallyReturnCompositions()) {
		addStaticComposition({
			component,
			durationInFrames,
			fps,
			height,
			name,
			width,
		});
	}

	return null;
};
