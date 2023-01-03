import type {AwsRegion} from '../pricing/aws-regions';
import {DEFAULT_AWS_REGIONS} from '../pricing/aws-regions';
import {AWS_REGIONS} from '../regions';

type Options = {
	enabledByDefaultOnly?: boolean;
};

/**
 * @description Gets an array of all supported AWS regions of this release of Remotion Lambda.
 * @link https://remotion.dev/docs/lambda/getregions
 * @returns {AwsRegion[]} A list of AWS regions.
 */
export const getRegions = (options?: Options): readonly AwsRegion[] => {
	const onlyEnabledByDefault = options?.enabledByDefaultOnly ?? false;
	return onlyEnabledByDefault ? DEFAULT_AWS_REGIONS : AWS_REGIONS;
};
