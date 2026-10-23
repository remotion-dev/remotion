import type {AwsRegion} from '@remotion/lambda-client';

export const getCurrentRegionInFunction = () => {
	if (!process.env.AWS_REGION) {
		throw new Error('Expected process.env.AWS_REGION to be defined');
	}

	return process.env.AWS_REGION as AwsRegion;
};
