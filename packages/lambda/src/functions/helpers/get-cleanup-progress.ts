import {_Object} from '@aws-sdk/client-s3';
import {CleanupInfo} from '../../shared/constants';
import {getFilesToDelete} from './get-files-to-delete';

export const getCleanupProgress = ({
	contents,
	output,
	chunkCount,
	renderId,
}: {
	contents: _Object[];
	output: string | null;
	chunkCount: number;
	renderId: string;
}): null | CleanupInfo => {
	if (output === null) {
		return null;
	}

	const filesToDelete = getFilesToDelete({chunkCount, renderId});
	const filesStillThere = contents.filter((c) =>
		filesToDelete.includes(c.Key as string)
	);

	const filesDeleted = filesToDelete.length - filesStillThere.length;

	return {
		filesToDelete: filesToDelete.length,
		filesDeleted,
		done: filesStillThere.length === 0,
	};
};
