import {TIMING_PROFILE_PREFIX} from '../constants';
import {lambdaWriteFile} from '../io';
import {ChunkTimingData} from './types';

export const writeTimingProfile = async ({
	data,
	bucketName,
}: {
	data: ChunkTimingData[];
	bucketName: string;
}) => {
	await lambdaWriteFile({
		bucketName,
		body: JSON.stringify(data),
		forceS3: true,
		key: TIMING_PROFILE_PREFIX + Date.now() + '.json',
	});
};
