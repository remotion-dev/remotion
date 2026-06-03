import {RenderInternals} from '@remotion/renderer';
import type {
	LogStudioErrorRequest,
	LogStudioErrorResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';

const coerceString = (value: unknown) => {
	return typeof value === 'string' && value.length > 0 ? value : null;
};

export const logStudioErrorHandler: ApiHandler<
	LogStudioErrorRequest,
	LogStudioErrorResponse
> = ({input, logLevel}) => {
	const name = coerceString(input.name);
	const message = coerceString(input.message) ?? 'Unknown Studio error';
	const stack = coerceString(input.stack);

	const headline = name ? `${name}: ${message}` : message;
	const output = stack
		? stack.startsWith(headline)
			? stack
			: `${headline}\n${stack}`
		: headline;

	RenderInternals.Log.error(
		{indent: false, logLevel, tag: 'studio-frontend'},
		output,
	);

	return Promise.resolve({});
};
