import type {CloudProvider, ProviderSpecifics} from '@remotion/serverless';
import {pLimit} from '../shared/p-limit';

const limit = pLimit(10);

export const cleanItems = <
	Provider extends CloudProvider,
	Region extends string,
>({
	bucket,
	onAfterItemDeleted,
	onBeforeItemDeleted,
	region,
	list,
	providerSpecifics,
}: {
	bucket: string;
	region: Region;
	list: string[];
	onBeforeItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	onAfterItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	providerSpecifics: ProviderSpecifics<Provider, Region>;
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
				});
				onAfterItemDeleted({
					bucketName: bucket,
					itemName: object,
				});
			}),
		),
	);
};
