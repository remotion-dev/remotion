import {Internals} from 'remotion';
import {extractEnumJsonPaths} from '../components/RenderModal/SchemaEditor/extract-enum-json-paths';
import {callUpdateDefaultPropsApi} from '../components/RenderQueue/actions';

export const updateDefaultProps = async ({
	id,
	defaultProps,
}: {
	id: string;
	defaultProps: Record<string, unknown>;
}) => {
	const compositions =
		Internals.compositionsRef.current?.getCompositions() ?? [];

	const entry = compositions.find((c) => c.id === id);
	if (!entry) {
		throw new Error('Composition not found');
	}

	const z = await import('zod');

	const res = await callUpdateDefaultPropsApi(
		id,
		defaultProps,
		entry.schema ? extractEnumJsonPaths(entry.schema, z, []) : [],
	);

	if (res.success) {
		return Promise.resolve();
	}

	const err = new Error(res.reason);
	err.stack = res.stack;

	return Promise.reject(err);
};
