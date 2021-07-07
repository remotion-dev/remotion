import {_Object} from '@aws-sdk/client-s3';

export const getCleanupProgress = ({
	chunks,
	output,
	chunkCount,
}: {
	chunks: _Object[];
	output: string | null;
	chunkCount: number;
}): null | {
	filesDeleted: number;
	done: boolean;
} => {
	if (output === null) {
		return null;
	}

	const filesDeleted = chunkCount - chunks.length;

	return {
		filesDeleted,
		done: chunks.length === 0,
	};
};
