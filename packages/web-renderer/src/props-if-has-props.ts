import type {ComponentType} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import type {AnyZodObject, z} from 'zod';

export type InferProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = AnyZodObject extends Schema
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

export type PropsIfHasProps<
	Schema extends AnyZodObject,
	Props,
> = AnyZodObject extends Schema
	? {} extends Props
		? {
				// Neither props nor schema specified
				inputProps?: z.input<Schema> & Props;
			}
		: {
				// Only props specified
				inputProps: Props;
			}
	: {} extends Props
		? {
				// Only schema specified
				inputProps: z.input<Schema>;
			}
		: {
				// Props and schema specified
				inputProps: z.input<Schema> & Props;
			};

type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);

type OptionalDimensions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	component: LooseComponentType<Props>;
	width?: number;
	height?: number;
	calculateMetadata: CalculateMetadataFunction<InferProps<Schema, Props>>;
};

type MandatoryDimensions<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	component: LooseComponentType<Props>;
	width: number;
	height: number;
	calculateMetadata?: CalculateMetadataFunction<InferProps<Schema, Props>>;
};

export type CompositionCalculateMetadataOrExplicit<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> =
	| (OptionalDimensions<Schema, Props> & {
			fps?: number;
			durationInFrames?: number;
	  })
	| (MandatoryDimensions<Schema, Props> & {
			fps: number;
			durationInFrames: number;
	  });
