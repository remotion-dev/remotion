export const AWS_REGIONS = [
	'eu-central-1',
	'eu-west-1',
	'eu-west-2',
	'us-east-1', // N. Virginia
	'us-east-2', // Ohio;
	'us-west-2', // Oregon
	'ap-south-1',
	'ap-southeast-1',
	'ap-southeast-2',
	'ap-northeast-1',
] as const;

export type AwsRegion = typeof AWS_REGIONS[number];
