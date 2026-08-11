import {AwsRegion, LambdaClientInternals} from '@remotion/lambda-client';
import {DEFAULT_REGION} from '@remotion/lambda-client/constants';
import {parsedLambdaCli} from './args';

export const getAwsRegion = (): AwsRegion => {
	if (parsedLambdaCli.region) {
		LambdaClientInternals.validateAwsRegion(parsedLambdaCli.region);
		return parsedLambdaCli.region;
	}

	const envVariable =
		LambdaClientInternals.getEnvVariable('REMOTION_AWS_REGION') ??
		LambdaClientInternals.getEnvVariable('AWS_REGION');
	if (envVariable) {
		LambdaClientInternals.validateAwsRegion(envVariable);
		return envVariable;
	}

	return DEFAULT_REGION;
};
