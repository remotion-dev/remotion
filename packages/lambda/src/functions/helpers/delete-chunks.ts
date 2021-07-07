import {AwsRegion} from '../..';
import {cleanItems} from '../../api/clean-items';
import {chunkKeyForIndex} from '../../shared/constants';

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
	const toDelete = new Array(chunkCount).fill(true).map((x, i) =>
		chunkKeyForIndex({
			index: i,
			renderId,
		})
	);

	await cleanItems({
		bucket,
		region,
		list: toDelete,
		onAfterItemDeleted: () => undefined,
		onBeforeItemDeleted: () => undefined,
	});
};
