import type {AwsRegion} from './regions';

export type AwsPartition = 'aws' | 'aws-cn';
export type AwsBillingCurrency = 'USD' | 'CNY';

export type AwsRegionMetadata = {
	partition: AwsPartition;
	dnsSuffix: 'amazonaws.com' | 'amazonaws.com.cn';
	consoleDomain: 'console.aws.amazon.com' | 'console.amazonaws.cn';
	billingCurrency: AwsBillingCurrency;
};

const regionPartitions: {[region in AwsRegion]: AwsPartition} = {
	'af-south-1': 'aws',
	'ap-east-1': 'aws',
	'ap-northeast-1': 'aws',
	'ap-northeast-2': 'aws',
	'ap-northeast-3': 'aws',
	'ap-south-1': 'aws',
	'ap-southeast-1': 'aws',
	'ap-southeast-2': 'aws',
	'ap-southeast-4': 'aws',
	'ap-southeast-5': 'aws',
	'ca-central-1': 'aws',
	'cn-north-1': 'aws-cn',
	'cn-northwest-1': 'aws-cn',
	'eu-central-1': 'aws',
	'eu-central-2': 'aws',
	'eu-north-1': 'aws',
	'eu-south-1': 'aws',
	'eu-west-1': 'aws',
	'eu-west-2': 'aws',
	'eu-west-3': 'aws',
	'sa-east-1': 'aws',
	'us-east-1': 'aws',
	'us-east-2': 'aws',
	'us-west-1': 'aws',
	'us-west-2': 'aws',
};

const partitionMetadata: {[partition in AwsPartition]: AwsRegionMetadata} = {
	aws: {
		partition: 'aws',
		dnsSuffix: 'amazonaws.com',
		consoleDomain: 'console.aws.amazon.com',
		billingCurrency: 'USD',
	},
	'aws-cn': {
		partition: 'aws-cn',
		dnsSuffix: 'amazonaws.com.cn',
		consoleDomain: 'console.amazonaws.cn',
		billingCurrency: 'CNY',
	},
};

export const getAwsPartitionMetadata = (
	partition: AwsPartition,
): AwsRegionMetadata => partitionMetadata[partition];

export const getAwsRegionMetadata = (region: AwsRegion): AwsRegionMetadata =>
	getAwsPartitionMetadata(regionPartitions[region]);
