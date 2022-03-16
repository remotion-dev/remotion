import {AwsRegion} from '../pricing/aws-regions';
import {AWS_REGIONS} from '../regions';

/**
 * @description Gets an array of all supported AWS regions of this release of Remotion Lambda.
 * @link https://v3.remotion.dev/docs/lambda/getregions
 * @returns {AwsRegion[]} A list of AWS regions.
 */
export const getRegions = (): readonly AwsRegion[] => {
	return AWS_REGIONS;
};
