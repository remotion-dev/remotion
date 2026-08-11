import type {ComponentType} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import type {z} from 'zod';
import type {$ZodObject} from 'zod/v4/core';

export type InferProps<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = $ZodObject extends Schema
	? {} extends Props
		? // Neither props nor schema specified
			Record<string, unknown>
		: // Only props specified
			Props
	: {} extends Props
		? // Only schema specified
			z.input<Schema>
		: // Props and schema specified
			z.input<Schema> & Props;

export type DefaultPropsIfHasProps<
	Schema extends $ZodObject,
	Props,
> = $ZodObject extends Schema
	? {} extends Props
		? {
				// Neither props nor schema specified
				defaultProps?: z.input<Schema> & Props;
			}
		: {
				// Only props specified
				defaultProps: Props;
			}
	: {} extends Props
		? {
				// Only schema specified
				defaultProps: z.input<Schema>;
			}
		: {
				// Props and schema specified
				defaultProps: z.input<Schema> & Props;
			};

type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);

type OptionalDimensions<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = {
	component: LooseComponentType<Props>;
	id: string;
	width?: number;
	height?: number;
	calculateMetadata: CalculateMetadataFunction<InferProps<Schema, Props>>;
};

type MandatoryDimensions<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = {
	component: LooseComponentType<Props>;
	id: string;
	width: number;
	height: number;
	calculateMetadata?: CalculateMetadataFunction<
		InferProps<Schema, Props>
	> | null;
};

export type CompositionCalculateMetadataOrExplicit<
	Schema extends $ZodObject,
	Props extends Record<string, unknown>,
> = (
	| (OptionalDimensions<Schema, Props> & {
			fps?: number;
			durationInFrames?: number;
	  })
	| (MandatoryDimensions<Schema, Props> & {
			fps: number;
			durationInFrames: number;
	  })
) &
	DefaultPropsIfHasProps<Schema, Props>;
