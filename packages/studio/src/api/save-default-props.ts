import {extractEnumJsonPaths} from '../components/RenderModal/SchemaEditor/extract-enum-json-paths';
import {callUpdateDefaultPropsApi} from '../components/RenderQueue/actions';
import type {UpdateDefaultPropsFunction} from './helpers/calc-new-props';
import {calcNewProps} from './helpers/calc-new-props';

/**
 * Saves the defaultProps for a composition back to the root file.
 * @param {string} compositionId The ID of the composition to save the defaultProps for.
 * @param {SafeDefaultPropsFunction} defaultProps A function that returns the new defaultProps for the composition.
 */
export const saveDefaultProps = async ({
	compositionId,
	defaultProps,
}: {
	compositionId: string;
	defaultProps: UpdateDefaultPropsFunction;
}) => {
	try {
		await import('zod');
	} catch {
		throw new Error(
			'"zod" is required to use saveDefaultProps(), but is not installed.',
		);
	}

	const z = await import('zod');

	const {generatedDefaultProps, composition} = calcNewProps(
		compositionId,
		defaultProps,
	);

	const res = await callUpdateDefaultPropsApi(
		compositionId,
		generatedDefaultProps,
		composition.schema ? extractEnumJsonPaths(composition.schema, z, []) : [],
	);

	if (res.success) {
		return Promise.resolve();
	}

	const err = new Error(res.reason);
	err.stack = res.stack;

	return Promise.reject(err);
};
