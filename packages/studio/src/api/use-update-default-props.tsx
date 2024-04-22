import {useContext} from 'react';
import {ResolvedCompositionContext} from '../components/RenderModal/ResolveCompositionBeforeModal';
import {extractEnumJsonPaths} from '../components/RenderModal/SchemaEditor/extract-enum-json-paths';
import {updateDefaultProps} from '../components/RenderQueue/actions';
import {useZodIfPossible} from '../components/get-zod-if-possible';

export const useUpdateDefaultProps = () => {
	// TODO: Probably doesn't use the same context as @remotion/studio/internals
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
