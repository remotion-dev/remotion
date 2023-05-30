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
			defaultProps?: RenamePropsIfHasProps<Schema, Props>;
	  }
	: {
			defaultProps: RenamePropsIfHasProps<Schema, Props>;
	  };

export type RenamePropsIfHasProps<
	Schema extends z.ZodTypeAny,
	Props
> = z.ZodTypeAny extends Schema
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
