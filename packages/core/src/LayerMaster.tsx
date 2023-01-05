import type {ComponentType, LazyExoticComponent} from 'react';
import React, {Suspense} from 'react';
import {AbsoluteFill} from './AbsoluteFill';

export type LooseComponentType<T> =
	| ComponentType<T>
	| ((props: T) => React.ReactNode);

export type Layer<T> = {
	component: LazyExoticComponent<ComponentType<T>>;
	type: 'web' | 'svg';
};

export const LayerMaster = <T extends object>({
	layers,
	defaultProps,
	inputProps,
	fallbackComponent: FallbackComponent,
}: {
	layers: Layer<T>[];
	defaultProps: T | undefined;
	inputProps: any;
	fallbackComponent: React.FC;
}) => {
	return (
		// TODO: Same styles as normal
		<AbsoluteFill>
			{layers.map((layer, i) => {
				const Comp = layer.component as unknown as ComponentType<T>;
				if (layer.type === 'web') {
					return (
						// eslint-disable-next-line react/no-array-index-key
						<Suspense key={String(i)} fallback={<FallbackComponent />}>
							<Comp {...defaultProps} {...inputProps} />
						</Suspense>
					);
				}

				if (layer.type === 'svg') {
					return (
						// eslint-disable-next-line react/no-array-index-key
						<Suspense key={String(i)} fallback={<FallbackComponent />}>
							<Comp {...defaultProps} {...inputProps} />
						</Suspense>
					);
				}

				throw new Error('Unknown layer type');
			})}
		</AbsoluteFill>
	);
};
