import * as z from 'zod/mini';

export type RenderOutputDragData = {
	type: 'remotion-render-output';
	version: 1;
	outputPath: string;
	fileName: string;
};

const renderOutputDragDataSchema = z.object({
	type: z.literal('remotion-render-output'),
	version: z.literal(1),
	outputPath: z.string().check(z.minLength(1)),
	fileName: z
		.string()
		.check(
			z.refine(
				(value) =>
					value.length > 0 && !value.includes('/') && !value.includes('\\'),
			),
		),
});

export const makeRenderOutputDragData = ({
	outputPath,
	fileName,
}: {
	outputPath: string;
	fileName: string;
}): RenderOutputDragData => {
	return {
		type: 'remotion-render-output',
		version: 1,
		outputPath,
		fileName,
	};
};

export const parseRenderOutputDragData = (
	value: string,
): RenderOutputDragData | null => {
	try {
		const parsed = z.safeParse(renderOutputDragDataSchema, JSON.parse(value));
		return parsed.success
			? makeRenderOutputDragData({
					outputPath: parsed.data.outputPath,
					fileName: parsed.data.fileName,
				})
			: null;
	} catch {
		return null;
	}
};
