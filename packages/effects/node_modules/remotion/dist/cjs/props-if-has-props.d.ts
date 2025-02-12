import type { AnyZodObject, z } from 'zod';
type And<A extends boolean, B extends boolean> = A extends true ? B extends true ? true : false : false;
export type PropsIfHasProps<Schema extends AnyZodObject, Props extends Record<string, unknown>> = And<AnyZodObject extends Schema ? true : false, {} extends Props ? true : false> extends true ? {
    defaultProps?: {};
} : {
    defaultProps: InferProps<Schema, Props>;
};
export type InferProps<Schema extends AnyZodObject, Props extends Record<string, unknown>> = AnyZodObject extends Schema ? {} extends Props ? Record<string, unknown> : Props : {} extends Props ? z.input<Schema> : // Props and schema specified
z.input<Schema> & Props;
export {};
