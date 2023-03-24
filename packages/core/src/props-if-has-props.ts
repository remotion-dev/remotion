import type {z} from 'zod';

export type PropsIfHasProps<
	Schema extends z.ZodTypeAny,
	Props
> = z.ZodTypeAny extends Schema
	? {} extends Props
		? {
				// Neither props nor schema specified
				defaultProps?: z.infer<Schema> & Props;
		  }
		: {
				// Only props specified
				defaultProps: Props;
		  }
	: {
			defaultProps: z.infer<Schema> & Props;
	  };
