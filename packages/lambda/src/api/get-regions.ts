import {AwsRegion} from '..';
import {AWS_REGIONS} from '../regions';

/**
 * @description Gets an array of all supported AWS regions of this release of Remotion Lambda.
 * @link https://remotion-3.vercel.app/docs/lambda/getregions
 * @returns {AwsRegion[]} A list of AWS regions.
 */
export const getRegions = (): readonly AwsRegion[] => {
	return AWS_REGIONS;
};
