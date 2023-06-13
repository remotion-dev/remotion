import React from 'react';
import type {AnyZodObject} from 'zod';
import type {CompositionProps, StillProps} from './Composition.js';
import {Composition} from './Composition.js';

/**
 * @description A `<Still />` is a `<Composition />` that is only 1 frame long.
 * @see [Documentation](https://www.remotion.dev/docs/still)
 */

export const Still = <
	Schema extends AnyZodObject,
	Props extends Record<string, unknown> | undefined
>(
	props: StillProps<Schema, Props>
) => {
	const newProps: CompositionProps<Schema, Props> = {
		...props,
		durationInFrames: 1,
		fps: 1,
	};
	// @ts-expect-error TypeScript does not understand it, but should still fail on type mismatch
	return React.createElement(Composition<Schema, Props>, newProps);
};
