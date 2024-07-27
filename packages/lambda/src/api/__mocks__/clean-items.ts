import {mockDeleteS3File} from '../../test/mocks/mock-store';
import type {cleanItems as original} from '../clean-items';

export const cleanItems: typeof original = (input) => {
	for (const item of input.list) {
		input.onBeforeItemDeleted?.({
			bucketName: input.bucket,
			itemName: item,
		});
		mockDeleteS3File({
			key: item,
			bucketName: input.bucket,
			region: input.region,
		});
		input.onAfterItemDeleted?.({
			bucketName: input.bucket,
			itemName: item,
		});
	}

	return Promise.resolve([]);
};
