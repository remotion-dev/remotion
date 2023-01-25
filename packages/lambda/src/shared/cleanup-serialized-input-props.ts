import type {AwsRegion} from '../client';
import {lambdaDeleteFile} from '../functions/helpers/io';
import type {SerializedInputProps} from './constants';
import {inputPropsKey} from './constants';

export const cleanupSerializedInputProps = async ({
	serialized,
	region,
	bucketName,
}: {
	serialized: SerializedInputProps;
	region: AwsRegion;
	bucketName: string;
}): Promise<number> => {
	if (serialized.type === 'payload') {
		return 0;
	}

	const time = Date.now();
	await lambdaDeleteFile({
		bucketName,
		key: inputPropsKey(serialized.hash),
		region,
		customCredentials: null,
	});

	return Date.now() - time;
};
