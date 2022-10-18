import type {_Object} from '@aws-sdk/client-s3';
import {cleanItems} from '../../api/clean-items';
import type {AwsRegion} from '../../pricing/aws-regions';
import type {CleanupJob} from './get-files-to-delete';

export const cleanupFiles = async ({
	bucket,
	region,
	contents,
	jobs,
}: {
	bucket: string;
	region: AwsRegion;
	contents: _Object[];
	jobs: CleanupJob[];
}) => {
	const start = Date.now();

	await cleanItems({
		bucket,
		region,
		list: jobs.map((item) => {
			if (item.type === 'exact') {
				return item.name;
			}

			if (item.type === 'prefix') {
				return contents.find((c) => c.Key?.startsWith(item.name))
					?.Key as string;
			}

			throw new Error('unexpected in deleteChunks()');
		}),
		onAfterItemDeleted: () => undefined,
		onBeforeItemDeleted: () => undefined,
	});
	return Date.now() - start;
};
