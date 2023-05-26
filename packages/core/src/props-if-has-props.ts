import type {AnyZodObject, z} from 'zod';

export type PropsIfHasProps<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown> | undefined
> = AnyZodObject extends Schema
	? {} extends Props
		? {
				// Neither props nor schema specified
				defaultProps?: Props;
		  }
		: {
				// Only props specified
				defaultProps: Props;
		  }
	: {} extends Props
	? {
			// Only schema specified
			defaultProps: z.infer<Schema>;
	  }
	: {
			// Props and schema specified
			defaultProps: z.infer<Schema> & Props;
	  };
