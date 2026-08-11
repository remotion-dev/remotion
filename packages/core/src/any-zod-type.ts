import type * as z3 from 'zod/v3';
import type * as z4 from 'zod/v4/core';

/**
 * Structural type for standalone zod v3 (e.g. 3.22.x) ZodObject,
 * which predates Standard Schema and lacks ~standard/~validate.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StandaloneZodV3Object = {_def: any; _input: any; [k: string]: any};

export type AnyZodObject =
	| z3.AnyZodObject
	| z4.$ZodObject
	| StandaloneZodV3Object;
