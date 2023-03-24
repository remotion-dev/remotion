import type {z} from 'remotion';

export type PropsIfHasProps<
	Schema extends z.ZodTypeAny,
	Props
> = z.ZodTypeAny extends Schema
	? {
			inputProps?: z.infer<Schema> & Props;
	  }
	: {
			inputProps: z.infer<Schema> & Props;
	  };
