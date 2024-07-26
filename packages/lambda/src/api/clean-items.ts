import {DeleteObjectCommand} from '@aws-sdk/client-s3';
import type {AwsRegion} from '../regions';
import {getS3Client} from '../shared/aws-clients';
import {pLimit} from '../shared/p-limit';

const limit = pLimit(10);

export const cleanItems = ({
	bucket,
	onAfterItemDeleted,
	onBeforeItemDeleted,
	region,
	list,
}: {
	bucket: string;
	region: AwsRegion;
	list: string[];
	onBeforeItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	onAfterItemDeleted: (data: {bucketName: string; itemName: string}) => void;
}) => {
	return Promise.all(
		list.map((object) =>
			limit(async () => {
				onBeforeItemDeleted({
					bucketName: bucket,
					itemName: object,
				});
				await getS3Client(region, null).send(
					new DeleteObjectCommand({
						Bucket: bucket,
						Key: object,
					}),
				);
				onAfterItemDeleted({
					bucketName: bucket,
					itemName: object,
				});
			}),
		),
	);
};
