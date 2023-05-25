import type {z} from 'zod';

export type PropsIfHasProps<
	Schema extends z.ZodTypeAny,
	Props
> = unknown extends RenamePropsIfHasProps<Schema, Props>
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
