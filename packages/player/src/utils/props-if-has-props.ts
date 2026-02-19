import type {AnyZodObject} from 'remotion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferZodInput<T> = T extends {_zod: {input: any}}
	? T['_zod']['input']
	: // eslint-disable-next-line @typescript-eslint/no-explicit-any
		T extends {_input: any}
		? T['_input']
		: Record<string, unknown>;

export type PropsIfHasProps<
	Schema extends AnyZodObject,
	Props,
> = AnyZodObject extends Schema
	? {} extends Props
		? {
				// Neither props nor schema specified
				inputProps?: InferZodInput<Schema> & Props;
			}
		: {
				// Only props specified
				inputProps: Props;
			}
	: {} extends Props
		? {
				// Only schema specified
				inputProps: InferZodInput<Schema>;
			}
		: {
				// Props and schema specified
				inputProps: InferZodInput<Schema> & Props;
			};
