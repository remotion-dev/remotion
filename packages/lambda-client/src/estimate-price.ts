import {MIN_EPHEMERAL_STORAGE_IN_MB} from './constants';
import {pricing} from './price-per-1s';
import type {AwsRegion} from './regions';
import {validateAwsRegion} from './validate-aws-region';
import {validateDiskSizeInMb} from './validate-disk-size-in-mb';
import {validateMemorySize} from './validate-memory-size';

type Miliseconds =
	| {
			/**
			 * @deprecated Typo in property name. Use `durationInMilliseconds` instead.
			 */
			durationInMiliseconds: number;
	  }
	| {
			durationInMilliseconds: number;
	  };

export type EstimatePriceInput = {
	region: AwsRegion;
	memorySizeInMb: number;
	diskSizeInMb: number;
	lambdasInvoked: number;
} & Miliseconds;

/*
 * @description Calculates the AWS costs incurred for AWS Lambda given the region, execution duration and memory size.
 * @see [Documentation](https://remotion.dev/docs/lambda/estimateprice)
 */
export const estimatePrice = ({
	region,
	memorySizeInMb,
	diskSizeInMb,
	lambdasInvoked,
	...other
}: EstimatePriceInput): number => {
	validateMemorySize(memorySizeInMb);
	validateAwsRegion(region);
	validateDiskSizeInMb(diskSizeInMb);

	const durationInMilliseconds =
		'durationInMiliseconds' in other
			? other.durationInMiliseconds
			: other.durationInMilliseconds;

	if (typeof durationInMilliseconds !== 'number') {
		throw new TypeError(
			`Parameter 'durationInMilliseconds' must be a number but got ${typeof durationInMilliseconds}`,
		);
	}

	if (Number.isNaN(durationInMilliseconds)) {
		throw new TypeError(
			`Parameter 'durationInMilliseconds' must not be NaN but it is.`,
		);
	}

	if (!Number.isFinite(durationInMilliseconds)) {
		throw new TypeError(
			`Parameter 'durationInMilliseconds' must be finite but it is ${durationInMilliseconds}`,
		);
	}

	if (durationInMilliseconds < 0) {
		throw new TypeError(
			`Parameter 'durationInMilliseconds' must be over 0 but it is ${durationInMilliseconds}.`,
		);
	}

	const durationPrice = pricing[region]['Lambda Duration-ARM'].price;

	// In GB-second
	const timeCostDollars =
		Number(durationPrice) *
		((memorySizeInMb * durationInMilliseconds) / 1000 / 1024);

	const diskSizePrice = pricing[region]['Lambda Storage-Duration-ARM'].price;

	const chargedDiskSize = Math.max(
		0,
		diskSizeInMb - MIN_EPHEMERAL_STORAGE_IN_MB,
	);
	// In GB-second
	const diskSizeDollars =
		chargedDiskSize *
		Number(diskSizePrice) *
		(durationInMilliseconds / 1000 / 1024);

	const invocationCost =
		Number(pricing[region]['Lambda Requests'].price) * lambdasInvoked;

	return Number(
		(timeCostDollars + diskSizeDollars + invocationCost).toFixed(5),
	);
};
