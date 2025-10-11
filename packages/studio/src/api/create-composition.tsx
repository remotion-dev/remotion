import type {CompositionProps, StillProps} from 'remotion';
import {Composition, Still} from 'remotion';
import type {AnyZodObject} from 'zod';

export const createComposition =
	<Schema extends AnyZodObject, Props extends Record<string, unknown>>({
		...other
	}: CompositionProps<Schema, Props>) =>
	() => {
		// @ts-expect-error
		return <Composition {...other} />;
	};

export const createStill =
	<Schema extends AnyZodObject, Props extends Record<string, unknown>>({
		...other
	}: StillProps<Schema, Props>) =>
	() => {
		// @ts-expect-error
		return <Still {...other} />;
	};
