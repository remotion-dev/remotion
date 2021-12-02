import {Internals} from 'remotion';
import {AwsRegion} from '../pricing/aws-regions';
import {DEFAULT_REGION} from '../shared/constants';
import {validateAwsRegion} from '../shared/validate-aws-region';
import {parsedLambdaCli} from './args';

export const getAwsRegion = (): AwsRegion => {
	if (Internals.isInLambda()) {
		throw new Error('Should not call getAwsRegion() if in lambda');
	}

	if (parsedLambdaCli.region) {
		validateAwsRegion(parsedLambdaCli.region);
		return parsedLambdaCli.region;
	}

	const envVariable = process.env.AWS_REGION;
	if (envVariable) {
		validateAwsRegion(envVariable);
		return envVariable;
	}

	return DEFAULT_REGION;
};
