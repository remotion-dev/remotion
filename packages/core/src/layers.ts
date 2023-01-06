import type {ComponentType, LazyExoticComponent} from 'react';
import React, {useRef} from 'react';

export type LooseComponentType<T> =
	| ComponentType<T>
	| ((props: T) => React.ReactNode);

export type InputLayer<T> = {
	component: LooseComponentType<T>;
	type: 'web' | 'svg';
};

export type CompProps<T> =
	| {
			lazyComponent: () => Promise<{default: LooseComponentType<T>}>;
	  }
	| {
			component: LooseComponentType<T>;
	  }
	| {
			layers: InputLayer<T>[];
	  };

export type Layer<T> = {
	component: LazyExoticComponent<ComponentType<T>>;
	type: 'web' | 'svg';
};

export type SmallLayer = Pick<Layer<unknown>, 'type'>;

const inputLayersToLayers = <T>(layers: InputLayer<T>[]) => {
	return layers.map((layer) => {
		if (layer.type === 'web') {
			return {
				component: React.lazy(() =>
					Promise.resolve({default: layer.component as ComponentType<T>})
				),
				type: 'web' as const,
			};
		}

		// No lazy for SVG allowed!
		return {
			component: layer.component as unknown as React.LazyExoticComponent<
				ComponentType<T>
			>,
			type: 'svg' as const,
		};
	});
};

export const convertComponentTypesToLayers = <T>(
	compProps: CompProps<T>
): Layer<T>[] => {
	if ('component' in compProps) {
		// In SSR, suspense is not yet supported, we cannot use React.lazy
		if (typeof document === 'undefined') {
			return [
				{
					component:
						compProps.component as unknown as React.LazyExoticComponent<
							ComponentType<T>
						>,
					type: 'web',
				},
			];
		}

		return [
			{
				component: React.lazy(() =>
					Promise.resolve({default: compProps.component as ComponentType<T>})
				),
				type: 'web',
			},
		];
	}

	if ('lazyComponent' in compProps) {
		return [
			{
				component: React.lazy(
					compProps.lazyComponent as () => Promise<{
						default: ComponentType<T>;
					}>
				),
				type: 'web',
			},
		];
	}

	if ('layers' in compProps) {
		return inputLayersToLayers(compProps.layers);
	}

	throw new Error('Unknown component type');
};

export const convertComponentTypesToLayersWithCache = <T>(
	compProps: CompProps<T>,
	prevCompProps: CompProps<T> | null,
	prevReturnValue: Layer<T>[] | null
): Layer<T>[] => {
	if ('component' in compProps) {
		if (
			prevCompProps &&
			'component' in prevCompProps &&
			compProps.component === prevCompProps.component &&
			prevReturnValue
		) {
			return prevReturnValue;
		}

		return [
			{
				type: 'web',
				component: React.lazy(() =>
					Promise.resolve({default: compProps.component as ComponentType<T>})
				),
			},
		];
	}

	if ('lazyComponent' in compProps) {
		if (
			prevCompProps &&
			'lazyComponent' in prevCompProps &&
			compProps.lazyComponent === prevCompProps.lazyComponent &&
			prevReturnValue
		) {
			return prevReturnValue;
		}

		return [
			{
				type: 'web',
				component: React.lazy(
					compProps.lazyComponent as () => Promise<{
						default: ComponentType<T>;
					}>
				),
			},
		];
	}

	if ('layers' in compProps) {
		const isTheSame = () => {
			if (!prevCompProps) {
				return false;
			}

			if (!('layers' in prevCompProps)) {
				return false;
			}

			if (compProps.layers.length !== prevCompProps.layers.length) {
				return false;
			}

			for (let i = 0; i < compProps.layers.length; i++) {
				if (
					compProps.layers[i].component !== prevCompProps.layers[i].component
				) {
					return false;
				}

				if (compProps.layers[i].type !== prevCompProps.layers[i].type) {
					return false;
				}
			}

			return true;
		};

		if (isTheSame()) {
			return prevReturnValue as Layer<T>[];
		}

		return inputLayersToLayers(compProps.layers);
	}

	throw new Error('Unknown component type');
};

export const useLayers = <T>(compProps: CompProps<T>) => {
	const prevCompProps = useRef<CompProps<T>>();
	const prevLayers = useRef<Layer<T>[]>();
	const layers = convertComponentTypesToLayersWithCache(
		compProps,
		prevCompProps.current ?? null,
		prevLayers.current ?? null
	);
	prevCompProps.current = compProps;
	prevLayers.current = layers;

	return layers;
};
