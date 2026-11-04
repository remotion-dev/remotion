import {getRemotionEnvironment} from 'remotion';
import type {ZodTypesType} from '../components/get-zod-if-possible';
import {extractEnumJsonPaths} from '../components/RenderModal/SchemaEditor/extract-enum-json-paths';
import {callUpdateDefaultPropsApi} from '../components/RenderQueue/actions';
import {getOriginalLocationFromStack} from '../components/Timeline/TimelineStack/get-stack';
import {
	getCachedResolvedStack,
	hasResolvedStack,
} from '../components/Timeline/use-resolved-stack';
import {resolvedStackToSymbolicated} from '../helpers/resolved-stack-to-symbolicated';
import type {UpdateDefaultPropsFunction} from './helpers/calc-new-props';
import {calcNewProps} from './helpers/calc-new-props';

/*
 * @description Saves the defaultProps for a composition back to the file that registers it.
 * @see [Documentation](https://www.remotion.dev/docs/studio/save-default-props)
 */
export const saveDefaultProps = async ({
	compositionId,
	defaultProps,
}: {
	compositionId: string;
	defaultProps: UpdateDefaultPropsFunction;
}) => {
	if (!getRemotionEnvironment().isStudio) {
		throw new Error('saveDefaultProps() is only available in the Studio');
	}

	if (window.remotion_isReadOnlyStudio) {
		throw new Error('saveDefaultProps() is not available in read-only Studio');
	}

	try {
		await import('zod');
	} catch {
		throw new Error(
			'"zod" is required to use saveDefaultProps(), but is not installed.',
		);
	}

	const z = await import('zod');
	let zodTypes: ZodTypesType | null = null;
	try {
		zodTypes = await import('@remotion/zod-types');
	} catch {}

	const {generatedDefaultProps, composition} = calcNewProps(
		compositionId,
		defaultProps,
	);

	const registrationLocation =
		composition.stack === null || hasResolvedStack(composition.stack)
			? getCachedResolvedStack(composition.stack)
			: await getOriginalLocationFromStack(composition.stack, 'sequence').catch(
					(error) => {
						// eslint-disable-next-line no-console
						console.warn(
							`saveDefaultProps(): Could not determine which file registers "${compositionId}", falling back to the root file`,
							error,
						);
						return null;
					},
				);

	const res = await callUpdateDefaultPropsApi(
		compositionId,
		generatedDefaultProps,
		composition.schema
			? extractEnumJsonPaths({
					schema: composition.schema,
					zodRuntime: z,
					currentPath: [],
					zodTypes,
				})
			: [],
		resolvedStackToSymbolicated(registrationLocation),
	);

	if (res.success) {
		return Promise.resolve();
	}

	const err = new Error(res.reason);
	err.stack = res.stack;

	return Promise.reject(err);
};
