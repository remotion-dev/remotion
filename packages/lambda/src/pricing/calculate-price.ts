import {AwsRegion} from './aws-regions';
import {pricing} from './price-per-1-s';

export const calculatePrice = ({
	region,
	durationMs,
	memory,
}: {
	region: AwsRegion;
	durationMs: number;
	memory: number;
}) => {
	const timeCostDollars =
		Number(pricing[region]['Lambda Duration'].price) *
		((memory * durationMs) / 1000 / 1024);

	const invocationCost = Number(pricing[region]['Lambda Requests'].price);

	return Number((timeCostDollars + invocationCost).toFixed(5));
};
