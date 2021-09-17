import {makeS3Url} from '../../shared/make-s3-url';
import {randomHash} from '../../shared/random-hash';
import {DeploySiteInput, DeploySiteReturnType} from '../deploy-site';
import {addMockBucket} from './mock-store';

export const deploySite = async (
	input: DeploySiteInput
): DeploySiteReturnType => {
	const subFolder = input.siteName ?? randomHash();
	addMockBucket({
		region: input.region,
		CreationDate: new Date(0),
		Name: input.bucketName,
	});

	return Promise.resolve({
		url: makeS3Url({
			bucketName: input.bucketName,
			region: input.region,
			subFolder,
		}),
	});
};
