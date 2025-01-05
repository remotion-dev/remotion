export const DEFAULT_AWS_REGIONS = [
	'eu-central-1',
	'eu-west-1',
	'eu-west-2',
	'eu-west-3',
	'eu-north-1',
	'us-east-1', // N. Virginia
	'us-east-2', // Ohio;
	'us-west-1',
	'us-west-2', // Oregon
	'ap-south-1',
	'ap-southeast-1',
	'ap-southeast-2',
	'ap-northeast-1',
	'ap-northeast-2',
	'ap-northeast-3',
	'ca-central-1',
	'sa-east-1',
] as const;

export const AWS_REGIONS = [
	'eu-central-1',
	'eu-central-2',
	'eu-west-1',
	'eu-west-2',
	'eu-west-3',
	'eu-south-1',
	'eu-north-1',
	'us-east-1', // N. Virginia
	'us-east-2', // Ohio;
	'us-west-1',
	'us-west-2', // Oregon
	'af-south-1',
	'ap-south-1',
	'ap-east-1',
	'ap-southeast-1',
	'ap-southeast-2',
	'ap-northeast-1',
	'ap-northeast-2',
	'ap-northeast-3',
	'ap-southeast-4',
	'ap-southeast-5',
	'ca-central-1',
	'me-south-1',
	'sa-east-1',
] as const;

export type AwsRegion = (typeof AWS_REGIONS)[number];
