import {Internals} from 'remotion';
import {extractEnumJsonPaths} from '../components/RenderModal/SchemaEditor/extract-enum-json-paths';
import {callUpdateDefaultPropsApi} from '../components/RenderQueue/actions';

export const saveDefaultProps = async ({
	compositionId,
	defaultProps,
}: {
	compositionId: string;
	defaultProps: () => Record<string, unknown>;
}) => {
	const compositions =
		Internals.compositionsRef.current?.getCompositions() ?? [];

	const entry = compositions.find((c) => c.id === compositionId);
	if (!entry) {
		throw new Error(
			`No composition with the ID ${compositionId} found. Available compositions: ${compositions.map((c) => c.id).join(', ')}`,
		);
	}

	const z = await import('zod');

	const generatedDefaultProps = defaultProps();

	const res = await callUpdateDefaultPropsApi(
		compositionId,
		generatedDefaultProps,
		entry.schema ? extractEnumJsonPaths(entry.schema, z, []) : [],
	);

	if (res.success) {
		return Promise.resolve();
	}

	const err = new Error(res.reason);
	err.stack = res.stack;

	return Promise.reject(err);
};
