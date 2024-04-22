import {useContext} from 'react';
import {ResolvedCompositionContext} from './RenderModal/ResolveCompositionBeforeModal';
import {extractEnumJsonPaths} from './RenderModal/SchemaEditor/extract-enum-json-paths';
import {updateDefaultProps} from './RenderQueue/actions';
import {useZodIfPossible} from './get-zod-if-possible';

export const useUpdateDefaultProps = () => {
	const context = useContext(ResolvedCompositionContext);
	if (!context) {
		throw new Error(
			'Does not have ResolvedCompositionContext. Did you call this API outside of your composition?.',
		);
	}

	const z = useZodIfPossible();

	const {unresolved: unresolvedComposition} = context;

	if (!z) {
		throw new Error(
			'To call useUpdateDefaultProps(), you need to have Zod installed.',
		);
	}

	if (!unresolvedComposition.schema) {
		throw new Error(
			'To call useUpdateDefaultProps(), you need to have a schema in your composition.',
		);
	}

	return updateDefaultProps(
		unresolvedComposition.id,
		z,
		extractEnumJsonPaths(unresolvedComposition.schema, z, []),
	);
};
