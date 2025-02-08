import type {AwsRegion} from '../regions';
import {DEFAULT_REGION} from '../shared/constants';
import {getEnvVariable} from '../shared/get-env-variable';
import {validateAwsRegion} from '../shared/validate-aws-region';
import {parsedLambdaCli} from './args';

export const getAwsRegion = (): AwsRegion => {
	if (parsedLambdaCli.region) {
		validateAwsRegion(parsedLambdaCli.region);
		return parsedLambdaCli.region;
	}

	const envVariable =
		getEnvVariable('REMOTION_AWS_REGION') ?? getEnvVariable('AWS_REGION');
	if (envVariable) {
		validateAwsRegion(envVariable);
		return envVariable;
	}

	return DEFAULT_REGION;
};
