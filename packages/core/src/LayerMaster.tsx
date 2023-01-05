import type {ComponentType} from 'react';
import React, {Suspense} from 'react';
import {AbsoluteFill} from './AbsoluteFill';
import type {Layer} from './layers';

export const LayerMaster = <T extends object>({
	layers,
	defaultProps,
	inputProps,
	fallbackComponent: FallbackComponent,
}: {
	layers: Layer<T>[];
	defaultProps: T | undefined;
	inputProps: any;
	fallbackComponent: React.FC | null;
}) => {
	return (
		// TODO: Same styles as normal
		<AbsoluteFill>
			{layers.map((layer, i) => {
				const Comp = layer.component as unknown as ComponentType<T>;
				if (layer.type === 'web') {
					if (FallbackComponent === null) {
						// eslint-disable-next-line react/no-array-index-key
						return <Comp key={String(i)} {...defaultProps} {...inputProps} />;
					}

					return (
						// eslint-disable-next-line react/no-array-index-key
						<Suspense key={String(i)} fallback={<FallbackComponent />}>
							<Comp {...defaultProps} {...inputProps} />
						</Suspense>
					);
				}

				// SVG should not support suspense
				if (layer.type === 'svg') {
					// eslint-disable-next-line react/no-array-index-key
					return <Comp key={String(i)} {...defaultProps} {...inputProps} />;
				}

				throw new Error('Unknown layer type');
			})}
		</AbsoluteFill>
	);
};
