import type {AnyZodObject, z} from 'zod';

type And<A extends boolean, B extends boolean> = A extends true
	? B extends true
		? true
		: false
	: false;

export type PropsIfHasProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown> | undefined
> = And<
	AnyZodObject extends Schema ? true : false,
	{} extends Props ? true : false
> extends true
	? {
			// Neither props nor schema specified
			defaultProps?: {};
	  }
	: // All the other cases
	  {
			defaultProps: InferProps<Schema, Props>;
	  };

export type InferProps<
	Schema extends AnyZodObject,
	Props
> = AnyZodObject extends Schema
	? {} extends Props
		? // Neither props nor schema specified
		  unknown
		: // Only props specified
		  Props
	: {} extends Props
	? // Only schema specified
	  z.infer<Schema>
	: // Props and schema specified
	  z.infer<Schema> & Props;
