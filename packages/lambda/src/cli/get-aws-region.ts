import {AwsRegion} from '../pricing/aws-regions';
import {isInLambda} from '../shared/tmpdir';
import {validateAwsRegion} from '../shared/validate-aws-region';
import {parsedLambdaCli} from './args';

const DEFAULT_REGION: AwsRegion = 'us-east-1';

export const getAwsRegion = (): AwsRegion => {
	if (isInLambda) {
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
