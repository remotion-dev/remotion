import type {z} from 'remotion';

export type PropsIfHasProps<Props extends z.ZodTypeAny> = {} extends Props
	? {
			inputProps?: z.infer<Props>;
	  }
	: {
			inputProps: z.infer<Props>;
	  };
