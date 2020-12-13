import {useContext, useEffect} from 'react';
import {CompositionManager} from './CompositionManager';
import {
	addStaticComposition,
	getShouldStaticallyReturnCompositions,
} from './register-root';

export const Composition: React.FC<{
	component: React.FC<any>;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	name: string;
}> = ({component, width, height, fps, durationInFrames, name}) => {
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
		registerComposition({
			durationInFrames,
			fps,
			height,
			width,
			name,
			component,
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
