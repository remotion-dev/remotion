// eslint-disable-next-line no-restricted-imports
import type {TCompMetadata} from 'remotion';
import {getCompositionId} from './get-composition-id';

export const getCompositionWithDimensionOverride = async ({
	validCompositions,
	height,
	width,
	args,
}: {
	validCompositions: TCompMetadata[];
	height: number | null;
	width: number | null;
	args: string[];
}): Promise<{
	compositionId: string;
	reason: string;
	config: TCompMetadata;
	argsAfterComposition: string[];
}> => {
	const returnValue = await getCompositionId(validCompositions, args);
	return {
		...returnValue,
		config: {
			...returnValue.config,
			height: height ?? returnValue.config.height,
			width: width ?? returnValue.config.width,
		},
	};
};
