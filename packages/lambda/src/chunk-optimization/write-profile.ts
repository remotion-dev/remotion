import {timingProfileName} from '../constants';
import {lambdaWriteFile} from '../io';
import {TimingProfile} from './types';

export const writeTimingProfile = async ({
	data,
	bucketName,
	renderId,
}: {
	data: TimingProfile;
	bucketName: string;
	renderId: string;
}) => {
	await lambdaWriteFile({
		bucketName,
		body: JSON.stringify(data),
		forceS3: true,
		key: timingProfileName(renderId) + Date.now() + '.json',
	});
};
