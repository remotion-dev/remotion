import * as z from 'zod/mini';

/**
 * @deprecated Composition dragging is internal to Remotion Studio and is not supported by Studio Protocol.
 */
export type CompositionDragData = {
	type: 'remotion-composition';
	version: 1;
	compositionId: string;
	compositionFile: string | null;
};

const compositionIdSchema = z
	.string()
	.check(
		z.refine(
			(value) =>
				value.length > 0 &&
				value.length < 500 &&
				/^([a-zA-Z0-9-\u4E00-\u9FFF])+$/.test(value),
		),
	);
const compositionFileSchema = z.nullable(
	z
		.string()
		.check(
			z.refine(
				(value) =>
					value.length > 0 &&
					value.length < 2000 &&
					!value.includes('\0') &&
					!value.includes('\\') &&
					!value.startsWith('/') &&
					!value.split('/').includes('..'),
			),
		),
);
const compositionDragDataSchema = z.object({
	type: z.literal('remotion-composition'),
	version: z.literal(1),
	compositionId: compositionIdSchema,
	compositionFile: compositionFileSchema,
});

export const makeCompositionDragData = ({
	compositionFile,
	compositionId,
}: {
	compositionFile: string | null;
	compositionId: string;
}): CompositionDragData => {
	return {
		type: 'remotion-composition',
		version: 1,
		compositionFile,
		compositionId,
	};
};

export const parseCompositionDragData = (
	value: string,
): CompositionDragData | null => {
	try {
		const parsed = z.safeParse(compositionDragDataSchema, JSON.parse(value));
		return parsed.success
			? makeCompositionDragData({
					compositionFile: parsed.data.compositionFile,
					compositionId: parsed.data.compositionId,
				})
			: null;
	} catch {
		return null;
	}
};
