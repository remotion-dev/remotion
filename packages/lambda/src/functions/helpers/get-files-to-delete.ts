import {
	chunkKeyForIndex,
	encodingProgressKey,
	lambdaInitializedPrefix,
	lambdaTimingsPrefixForChunk,
} from '../../shared/constants';

export type CleanupJob = {
	name: string;
	type: 'exact' | 'prefix';
};

export const getFilesToDelete = ({
	chunkCount,
	renderId,
}: {
	chunkCount: number;
	renderId: string;
}): CleanupJob[] => {
	const chunks = new Array(chunkCount).fill(true).map((_x, i) =>
		chunkKeyForIndex({
			index: i,
			renderId,
		})
	);
	const lambdaTimings = new Array(chunkCount)
		.fill(true)
		.map((_x, i) => lambdaTimingsPrefixForChunk(renderId, i));
	return [
		{
			name: lambdaInitializedPrefix(renderId),
			type: 'prefix' as const,
		},
		...chunks.map((i) => {
			return {
				name: i,
				type: 'exact' as const,
			};
		}),
		...lambdaTimings.map((i) => {
			return {
				name: i,
				type: 'prefix' as const,
			};
		}),
		{
			name: encodingProgressKey(renderId),
			type: 'exact',
		},
	];
};
