import type {TCompMetadata, z} from 'remotion';
import {getCompositionId} from './get-composition-id';

export const getCompositionWithDimensionOverride = async ({
	validCompositions,
	height,
	width,
	args,
	compositionIdFromUi,
}: {
	validCompositions: TCompMetadata<z.ZodTypeAny>[];
	height: number | null;
	width: number | null;
	args: string[];
	compositionIdFromUi: string | null;
}): Promise<{
	compositionId: string;
	reason: string;
	config: TCompMetadata<z.ZodTypeAny>;
	argsAfterComposition: string[];
}> => {
	const returnValue = await getCompositionId({
		validCompositions,
		args,
		compositionIdFromUi,
	});

	return {
		...returnValue,
		config: {
			...returnValue.config,
			height: height ?? returnValue.config.height,
			width: width ?? returnValue.config.width,
		},
	};
};
