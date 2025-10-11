import type {AwsRegion} from './regions';
import {AWS_REGIONS} from './regions';

export function validateAwsRegion(
	region: unknown,
): asserts region is AwsRegion {
	if (!AWS_REGIONS.includes(region as AwsRegion)) {
		throw new TypeError(
			`${region} is not a supported AWS region. Must be one of: ${AWS_REGIONS.join(
				', ',
			)}`,
		);
	}
}
