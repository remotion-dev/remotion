import {
	chunkKeyForIndex,
	encodingProgressKey,
	lambdaChunkInitializedPrefix,
	lambdaTimingsPrefixForChunk,
} from '../../shared/constants';
import type {RenderExpiryDays} from './lifecycle';

export type CleanupJob = {
	name: string;
	type: 'exact' | 'prefix';
};

export const getFilesToDelete = ({
	chunkCount,
	renderId,
	renderFolderExpiryInDays,
}: {
	chunkCount: number;
	renderId: string;
	renderFolderExpiryInDays: RenderExpiryDays | null;
}): CleanupJob[] => {
	const chunks = new Array(chunkCount).fill(true).map((_x, i) =>
		chunkKeyForIndex({
			index: i,
			renderId,
			renderFolderExpiryInDays,
		}),
	);
	const lambdaTimings = new Array(chunkCount)
		.fill(true)
		.map((_x, i) =>
			lambdaTimingsPrefixForChunk(renderId, i, renderFolderExpiryInDays),
		);
	return [
		{
			name: lambdaChunkInitializedPrefix(renderId, renderFolderExpiryInDays),
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
			name: encodingProgressKey(renderId, renderFolderExpiryInDays),
			type: 'exact',
		},
	];
};
