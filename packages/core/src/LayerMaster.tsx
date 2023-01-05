import type {ComponentType} from 'react';
import {useRef} from 'react';
import {AbsoluteFill} from './AbsoluteFill';
import type {CompProps} from './internals';

export type LooseComponentType<T> =
	| ComponentType<T>
	| ((props: T) => React.ReactNode);

export type Layer<T> = {
	// TODO: Support lazy component again?
	component: LooseComponentType<T>;
	type: 'web' | 'svg';
};

export const LayerMaster = <T extends object>({
	layers,
	props,
}: {
	layers: Layer<T>[];
	props: T;
}) => {
	return (
		// TODO: Same styles as normal
		<AbsoluteFill>
			{layers.map((layer) => {
				const Comp = layer.component as ComponentType<T>;
				if (layer.type === 'web') {
					return <Comp {...props} />;
				}

				if (layer.type === 'svg') {
					return <Comp {...props} />;
				}

				throw new Error('Unknown layer type');
			})}
		</AbsoluteFill>
	);
};

export const useLayers = <T extends object>(compProps: CompProps<T>) => {
	const lastProps = useRef(compProps);
	const last = useRef<((props: T) => JSX.Element) | null>(null);

	if ('layers' in compProps) {
		const isTheSame = () => {
			if (!('layers' in lastProps.current)) {
				return false;
			}

			if (compProps.layers.length !== lastProps.current.layers.length) {
				return false;
			}

			for (let i = 0; i < compProps.layers.length; i++) {
				if (
					compProps.layers[i].component !==
					lastProps.current.layers[i].component
				) {
					return false;
				}
			}

			return true;
		};

		if (isTheSame()) {
			return last.current;
		}

		const newComp = (props: T) => {
			return <LayerMaster layers={compProps.layers} props={props} />;
		};

		lastProps.current = compProps;
		last.current = newComp;

		return newComp;
	}

	return null;
};
