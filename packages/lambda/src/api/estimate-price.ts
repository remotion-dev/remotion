import {MIN_EPHEMERAL_STORAGE_IN_MB} from '../defaults';
import type {AwsRegion} from '../pricing/aws-regions';
import {pricing} from '../pricing/price-per-1-s';
import type {
	LambdaArchitecture} from '../shared/validate-architecture';
import {
	validateArchitecture,
} from '../shared/validate-architecture';
import {validateAwsRegion} from '../shared/validate-aws-region';
import {validateDiskSizeInMb} from '../shared/validate-disk-size-in-mb';
import {validateMemorySize} from '../shared/validate-memory-size';

export type EstimatePriceInput = {
	region: AwsRegion;
	durationInMiliseconds: number;
	memorySizeInMb: number;
	diskSizeInMb: number;
	architecture: LambdaArchitecture;
	lambdasInvoked: number;
};
/**
 *
 * @description Calculates the AWS costs incurred for AWS Lambda given the region, execution duration and memory size.
 * @link https://remotion.dev/docs/lambda/estimateprice
 * @returns {number} Price in USD
 */
export const estimatePrice = ({
	region,
	durationInMiliseconds,
	memorySizeInMb,
	diskSizeInMb,
	architecture,
	lambdasInvoked,
}: EstimatePriceInput): number => {
	validateMemorySize(memorySizeInMb);
	validateAwsRegion(region);
	validateArchitecture(architecture);
	validateDiskSizeInMb(diskSizeInMb);
	if (typeof durationInMiliseconds !== 'number') {
		throw new TypeError(
			`Parameter 'durationInMiliseconds' must be a number but got ${typeof durationInMiliseconds}`
		);
	}

	if (Number.isNaN(durationInMiliseconds)) {
		throw new TypeError(
			`Parameter 'durationInMiliseconds' must not be NaN but it is.`
		);
	}

	if (!Number.isFinite(durationInMiliseconds)) {
		throw new TypeError(
			`Parameter 'durationInMiliseconds' must be finite but it is ${durationInMiliseconds}`
		);
	}

	if (durationInMiliseconds < 0) {
		throw new TypeError(
			`Parameter 'durationInMiliseconds' must be over 0 but it is ${durationInMiliseconds}.`
		);
	}

	const durationPrice =
		architecture === 'x86_64'
			? pricing[region]['Lambda Duration'].price
			: pricing[region]['Lambda Duration-ARM'].price;

	// In GB-second
	const timeCostDollars =
		Number(durationPrice) *
		((memorySizeInMb * durationInMiliseconds) / 1000 / 1024);

	const diskSizePrice =
		architecture === 'x86_64'
			? pricing[region]['Lambda Storage-Duration'].price
			: pricing[region]['Lambda Storage-Duration-ARM'].price;

	const chargedDiskSize = Math.max(
		0,
		diskSizeInMb - MIN_EPHEMERAL_STORAGE_IN_MB
	);
	// In GB-second
	const diskSizeDollars =
		chargedDiskSize *
		Number(diskSizePrice) *
		(durationInMiliseconds / 1000 / 1024);

	const invocationCost =
		Number(pricing[region]['Lambda Requests'].price) * lambdasInvoked;

	return Number(
		(timeCostDollars + diskSizeDollars + invocationCost).toFixed(5)
	);
};
