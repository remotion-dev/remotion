import {AwsRegion, AWS_REGIONS} from '../pricing/aws-regions';
import {isInLambda} from '../shared/tmpdir';
import {parsedLambdaCli} from './args';

const DEFAULT_REGION: AwsRegion = 'us-east-1';

function validateAwsRegion(region: unknown): asserts region is AwsRegion {
	if (!AWS_REGIONS.includes(region as AwsRegion)) {
		throw new TypeError(
			`${region} is not a valid AWS region. Must be one of: ${AWS_REGIONS.join(
				', '
			)}`
		);
	}
}

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
