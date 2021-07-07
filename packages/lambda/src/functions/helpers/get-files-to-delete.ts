import {
	chunkKeyForIndex,
	encodingProgressKey,
	lambdaInitializedKey,
} from '../../shared/constants';

export const getFilesToDelete = ({
	chunkCount,
	renderId,
}: {
	chunkCount: number;
	renderId: string;
}) => {
	const initialized = new Array(chunkCount).fill(true).map((x, i) =>
		lambdaInitializedKey({
			chunk: i,
			renderId,
		})
	);
	const chunks = new Array(chunkCount).fill(true).map((x, i) =>
		chunkKeyForIndex({
			index: i,
			renderId,
		})
	);
	return [...initialized, ...chunks, encodingProgressKey(renderId)];
};
