import {useContext, useEffect} from 'react';
import {AnyComponent} from './any-component';
import {CompositionManager} from './CompositionManager';
import {useNonce} from './nonce';
import {
	addStaticComposition,
	getIsEvaluation,
	removeStaticComposition,
} from './register-root';
import {useLazyComponent} from './use-lazy-component';
import {validateDimension} from './validation/validate-dimensions';
import {validateDurationInFrames} from './validation/validate-duration-in-frames';
import {validateFps} from './validation/validate-fps';

export type CompProps<C extends AnyComponent> =
	| {
			lazyComponent: () => Promise<{default: C}>;
	  }
	| {
			component: C;
	  };

type Props<C extends AnyComponent> = {
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	id: string;
        defaultProps?: Omit<P, keyof C["defaultProps"]>;
} & CompProps<C>;

export const Composition = <C extends AnyComponent,>({
	width,
	height,
	fps,
	durationInFrames,
	id,
	defaultProps: props,
	...compProps
}: Props<C>) => {
	const {registerComposition, unregisterComposition} = useContext(
		CompositionManager
	);

	const lazy = useLazyComponent(compProps);
	const nonce = useNonce();

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

		validateDimension(width, 'width', 'of the <Composition/> component');
		validateDimension(height, 'height', 'of the <Composition/> component');
		validateDurationInFrames(
			durationInFrames,
			'of the <Composition/> component'
		);
		validateFps(fps, 'as a prop of the <Composition/> component');
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
