import type {AnyZodObject} from './any-zod-type.js';

type And<A extends boolean, B extends boolean> = A extends true
	? B extends true
		? true
		: false
	: false;

/**
 * Infer the input type of a zod schema using structural typing.
 * v3 schemas have `_input` phantom type.
 * v4 schemas have `_zod.input` phantom type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferZodInput<T> = T extends {_zod: {input: any}}
	? T['_zod']['input']
	: // eslint-disable-next-line @typescript-eslint/no-explicit-any
		T extends {_input: any}
		? T['_input']
		: Record<string, unknown>;

export type PropsIfHasProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> =
	And<
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
	Props extends Record<string, unknown>,
> = AnyZodObject extends Schema
	? {} extends Props
		? // Neither props nor schema specified
			Record<string, unknown>
		: // Only props specified
			Props
	: {} extends Props
		? // Only schema specified
			InferZodInput<Schema>
		: // Props and schema specified
			InferZodInput<Schema> & Props;
