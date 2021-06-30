import {timingProfileName} from '../../shared/constants';
import {getCurrentRegion} from '../helpers/get-current-region';
import {lambdaWriteFile} from '../helpers/io';
import {TimingProfile} from './types';

export const writeTimingProfile = async ({
	data,
	bucketName,
	renderId,
	expectedBucketOwner,
}: {
	data: TimingProfile;
	bucketName: string;
	renderId: string;
	expectedBucketOwner: string;
}) => {
	await lambdaWriteFile({
		bucketName,
		body: JSON.stringify(data),
		key: timingProfileName(renderId) + Date.now() + '.json',
		region: getCurrentRegion(),
		acl: 'private',
		expectedBucketOwner,
	});
};
