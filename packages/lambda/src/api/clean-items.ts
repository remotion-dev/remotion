import {DeleteObjectCommand, _Object} from '@aws-sdk/client-s3';
import pLimit from 'p-limit';
import {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';

const limit = pLimit(10);

export const cleanItems = async ({
	bucket,
	onAfterItemDeleted,
	onBeforeItemDeleted,
	region,
	list,
}: {
	bucket: string;
	region: AwsRegion;
	list: _Object[];
	onBeforeItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	onAfterItemDeleted: (data: {bucketName: string; itemName: string}) => void;
}) => {
	return Promise.all(
		list.map((object) =>
			limit(async () => {
				onBeforeItemDeleted({
					bucketName: bucket,
					itemName: object.Key as string,
				});
				await getS3Client(region).send(
					new DeleteObjectCommand({
						Bucket: bucket,
						Key: object.Key,
					})
				);
				onAfterItemDeleted({
					bucketName: bucket,
					itemName: object.Key as string,
				});
			})
		)
	);
};
