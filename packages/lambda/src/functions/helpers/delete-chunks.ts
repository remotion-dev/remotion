import {AwsRegion} from '../..';
import {cleanItems} from '../../api/clean-items';
import {getFilesToDelete} from './get-files-to-delete';

export const deleteChunks = async ({
	renderId,
	chunkCount,
	bucket,
	region,
}: {
	renderId: string;
	chunkCount: number;
	bucket: string;
	region: AwsRegion;
}) => {
	const toDelete = getFilesToDelete({
		chunkCount,
		renderId,
	});

	await cleanItems({
		bucket,
		region,
		list: toDelete,
		onAfterItemDeleted: () => undefined,
		onBeforeItemDeleted: () => undefined,
	});
};
