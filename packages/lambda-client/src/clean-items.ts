import {pLimit} from './p-limit';
import type {ProviderSpecifics} from './provider-implementation';
import type {AwsRegion} from './regions';
import type {RequestHandler} from './types';

const limit = pLimit(10);

type CleanItemsInput = {
	bucket: string;
	region: AwsRegion;
	list: string[];
	onBeforeItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	onAfterItemDeleted: (data: {bucketName: string; itemName: string}) => void;
	providerSpecifics: ProviderSpecifics;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
};

export const cleanItems = ({
	bucket,
	onAfterItemDeleted,
	onBeforeItemDeleted,
	region,
	list,
	providerSpecifics,
	forcePathStyle,
	requestHandler,
}: CleanItemsInput) => {
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
					requestHandler,
				});
				onAfterItemDeleted({
					bucketName: bucket,
					itemName: object,
				});
			}),
		),
	);
};
