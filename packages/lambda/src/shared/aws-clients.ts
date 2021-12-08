import {CloudWatchLogsClient} from '@aws-sdk/client-cloudwatch-logs';
import {IAMClient} from '@aws-sdk/client-iam';
import {LambdaClient} from '@aws-sdk/client-lambda';
import {S3Client} from '@aws-sdk/client-s3';
import {AwsRegion} from '../pricing/aws-regions';
import {checkCredentials} from './check-credentials';

const _cloudWatchLogsClients: Partial<Record<AwsRegion, CloudWatchLogsClient>> =
	{};
const _s3Clients: Partial<Record<AwsRegion, S3Client>> = {};
const _lambdaClients: Partial<Record<AwsRegion, LambdaClient>> = {};
const _iamClients: Partial<Record<AwsRegion, IAMClient>> = {};

const credentials =
	process.env.REMOTION_AWS_ACCESS_KEY_ID &&
	process.env.REMOTION_AWS_SECRET_ACCESS_KEY
		? {
				accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY,
		  }
		: undefined;

export const getCloudWatchLogsClient = (
	region: AwsRegion
): CloudWatchLogsClient => {
	if (!_cloudWatchLogsClients[region]) {
		checkCredentials();
		_cloudWatchLogsClients[region] = new CloudWatchLogsClient({region});
	}

	return _cloudWatchLogsClients[region] as CloudWatchLogsClient;
};

export const getS3Client = (region: AwsRegion) => {
	if (!_s3Clients[region]) {
		checkCredentials();
		_s3Clients[region] = new S3Client({region, credentials});
	}

	return _s3Clients[region] as S3Client;
};

export const getLambdaClient = (region: AwsRegion) => {
	if (!_lambdaClients[region]) {
		checkCredentials();
		_lambdaClients[region] = new LambdaClient({region, credentials});
	}

	return _lambdaClients[region] as LambdaClient;
};

export const getIamClient = (region: AwsRegion) => {
	if (!_iamClients[region]) {
		checkCredentials();
		_iamClients[region] = new IAMClient({region, credentials});
	}

	return _iamClients[region] as IAMClient;
};
