import type {AnyComposition} from 'remotion';
import {Internals, getRemotionEnvironment} from 'remotion';
import type {AnyZodObject} from 'zod';

export type UpdateDefaultPropsFunction = (currentValues: {
	schema: AnyZodObject | null;
	savedDefaultProps: Record<string, unknown>;
	unsavedDefaultProps: Record<string, unknown>;
}) => Record<string, unknown>;

export const calcNewProps = (
	compositionId: string,
	defaultProps: UpdateDefaultPropsFunction,
): {
	composition: AnyComposition;
	generatedDefaultProps: Record<string, unknown>;
} => {
	if (!getRemotionEnvironment().isStudio) {
		throw new Error(
			'saveDefaultProps can only be called in the Remotion Studio.',
		);
	}

	const {compositionsRef, editorPropsProviderRef} = Internals;

	const compositionsStore = compositionsRef.current;
	if (!compositionsStore) {
		throw new Error(
			'No compositions ref found. Are you in the Remotion Studio and are the Remotion versions aligned?',
		);
	}

	const compositions = compositionsStore.getCompositions();
	const composition = compositions.find((c) => c.id === compositionId);
	if (!composition) {
		throw new Error(
			`No composition with the ID ${compositionId} found. Available compositions: ${compositions.map((c) => c.id).join(', ')}`,
		);
	}

	const propsStore = editorPropsProviderRef.current;
	if (!propsStore) {
		throw new Error(
			'No props store found. Are you in the Remotion Studio and are the Remotion versions aligned?',
		);
	}

	const savedDefaultProps = composition.defaultProps ?? {};
	const unsavedDefaultProps =
		propsStore.getProps()[compositionId] ?? savedDefaultProps;

	const generatedDefaultProps = defaultProps({
		schema: composition.schema,
		savedDefaultProps,
		unsavedDefaultProps,
	});

	return {
		composition,
		generatedDefaultProps,
	};
};
