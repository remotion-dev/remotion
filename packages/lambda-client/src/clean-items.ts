import type {
	CloudProvider,
	ProviderSpecifics,
} from '@remotion/serverless-client';
import {pLimit} from './p-limit';

const limit = pLimit(10);

export const cleanItems = <Provider extends CloudProvider>({
	bucket,
	onAfterItemDeleted,
	onBeforeItemDeleted,
	region,
	list,
	providerSpecifics,
	forcePathStyle,
}: {
	bucket: string;
	region: Provider['region'];
	list: string[];
	onBeforeItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	onAfterItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	providerSpecifics: ProviderSpecifics<Provider>;
	forcePathStyle: boolean;
}) => {
	return Promise.all(
		list.map((object) =>
			limit(async () => {
				onBeforeItemDeleted({
					bucketName: bucket,
					itemName: object,
				});
				await providerSpecifics.deleteFile({
					bucketName: bucket,
					key: object,
					region,
					customCredentials: null,
					forcePathStyle,
				});
				onAfterItemDeleted({
					bucketName: bucket,
					itemName: object,
				});
			}),
		),
	);
};
