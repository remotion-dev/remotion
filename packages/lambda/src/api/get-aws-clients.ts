import * as cloudwatchSdk from '@aws-sdk/client-cloudwatch-logs';
import * as iamSdk from '@aws-sdk/client-iam';
import * as lambdaSdk from '@aws-sdk/client-lambda';
import * as s3Sdk from '@aws-sdk/client-s3';
import {AwsRegion} from '../client';
import {
	getCloudWatchLogsClient,
	getIamClient,
	getLambdaClient,
	getS3Client,
} from '../shared/aws-clients';

export const getAwsClients = (region: AwsRegion) => {
	return {
		s3Client: () => getS3Client(region),
		iamClient: () => getIamClient(region),
		cloudwatchClient: () => getCloudWatchLogsClient(region),
		lambdaClient: () => getLambdaClient(region),
		cloudwatchSdk,
		iamSdk,
		lambdaSdk,
		s3Sdk,
	};
};
