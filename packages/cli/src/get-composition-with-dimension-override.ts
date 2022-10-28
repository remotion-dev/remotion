// eslint-disable-next-line no-restricted-imports
import type {TCompMetadata} from 'remotion';
import {getCompositionId} from './get-composition-id';

export const getCompositionWithDimensionOverride = async ({
	validCompositions,
	height,
	width,
}: {
	validCompositions: TCompMetadata[];
	height: number | null;
	width: number | null;
}): Promise<{
	compositionId: string;
	reason: string;
	config: TCompMetadata;
}> => {
	const returnValue = await getCompositionId(validCompositions);
	return {
		...returnValue,
		config: {
			...returnValue.config,
			height: height ?? returnValue.config.height,
			width: width ?? returnValue.config.width,
		},
	};
};
