import type {AwsRegion} from '../../pricing/aws-regions';
import {isInsideLambda} from '../../shared/is-in-lambda';

export const getCurrentRegionInFunction = () => {
	if (!isInsideLambda()) {
		throw new Error(
			'Should not call getCurrentRegion() if not inside a lambda function'
		);
	}

	if (!process.env.AWS_REGION) {
		throw new Error('Expected process.env.AWS_REGION to be defined');
	}

	return process.env.AWS_REGION as AwsRegion;
};
