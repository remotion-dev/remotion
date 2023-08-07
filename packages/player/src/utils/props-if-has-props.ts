import type {AnyZodObject, z} from 'zod';

export type PropsIfHasProps<
	Schema extends AnyZodObject,
	Props
> = AnyZodObject extends Schema
	? {} extends Props
		? {
				// Neither props nor schema specified
				inputProps?: z.infer<Schema> & Props;
		  }
		: {
				// Only props specified
				inputProps: Props;
		  }
	: {} extends Props
	? {
			// Only schema specified
			inputProps: z.infer<Schema>;
	  }
	: {
			// Props and schema specified
			inputProps: z.infer<Schema> & Props;
	  };
