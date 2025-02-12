import type { AnyZodObject, z } from 'zod';
export type PropsIfHasProps<Schema extends AnyZodObject, Props> = AnyZodObject extends Schema ? {} extends Props ? {
    inputProps?: z.input<Schema> & Props;
} : {
    inputProps: Props;
} : {} extends Props ? {
    inputProps: z.input<Schema>;
} : {
    inputProps: z.input<Schema> & Props;
};
