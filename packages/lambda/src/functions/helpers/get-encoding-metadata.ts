import {EncodingProgress, encodingProgressKey} from '../../defaults';
import {AwsRegion} from '../../pricing/aws-regions';
import {streamToString} from '../../shared/stream-to-string';
import {lambdaReadFile} from './io';

export const getEncodingMetadata = async ({
	exists,
	bucketName,
	renderId,
	region,
}: {
	exists: boolean;
	bucketName: string;
	renderId: string;
	region: AwsRegion;
}): Promise<EncodingProgress | null> => {
	if (!exists) {
		return null;
	}

	const Body = await lambdaReadFile({
		bucketName,
		key: encodingProgressKey(renderId),
		region,
	});

	try {
		const encodingProgress = JSON.parse(
			await streamToString(Body)
		) as EncodingProgress;

		return encodingProgress;
	} catch (err) {
		// The file may not yet have been fully written
		return null;
	}
};
