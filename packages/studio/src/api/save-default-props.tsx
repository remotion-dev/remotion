import {Internals, getRemotionEnvironment} from 'remotion';
import type {AnyZodObject} from 'zod';
import {extractEnumJsonPaths} from '../components/RenderModal/SchemaEditor/extract-enum-json-paths';
import {callUpdateDefaultPropsApi} from '../components/RenderQueue/actions';

export type SafeDefaultPropsFunction = (currentValues: {
	schema: AnyZodObject | null;
	savedDefaultProps: Record<string, unknown>;
	unsavedDefaultProps: Record<string, unknown>;
}) => Record<string, unknown>;

export const saveDefaultProps = async ({
	compositionId,
	defaultProps,
}: {
	compositionId: string;
	defaultProps: SafeDefaultPropsFunction;
}) => {
	if (!getRemotionEnvironment().isStudio) {
		throw new Error(
			'saveDefaultProps can only be called in the Remotion Studio.',
		);
	}

	try {
		await import('zod');
	} catch {
		throw new Error(
			'"zod" is required to use saveDefaultProps(), but is not installed.',
		);
	}

	const z = await import('zod');

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
