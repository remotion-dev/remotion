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
	renderFolderExpiry,
}: {
	chunkCount: number;
	renderId: string;
	renderFolderExpiry: RenderExpiryDays | null;
}): CleanupJob[] => {
	const chunks = new Array(chunkCount).fill(true).map((_x, i) =>
		chunkKeyForIndex({
			index: i,
			renderId,
			renderFolderExpiry,
		}),
	);
	const lambdaTimings = new Array(chunkCount)
		.fill(true)
		.map((_x, i) =>
			lambdaTimingsPrefixForChunk(renderId, i, renderFolderExpiry),
		);
	return [
		{
			name: lambdaChunkInitializedPrefix(renderId, renderFolderExpiry),
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
			name: encodingProgressKey(renderId, renderFolderExpiry),
			type: 'exact',
		},
	];
};
