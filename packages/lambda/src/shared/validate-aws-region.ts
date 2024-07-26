import type {AwsRegion} from '@remotion/serverless/client';
import {AWS_REGIONS} from '@remotion/serverless/client';

export function validateAwsRegion(
	region: unknown,
): asserts region is AwsRegion {
	if (!AWS_REGIONS.includes(region as AwsRegion)) {
		throw new TypeError(
			`${region} is not a valid AWS region. Must be one of: ${AWS_REGIONS.join(
				', ',
			)}`,
		);
	}
}
