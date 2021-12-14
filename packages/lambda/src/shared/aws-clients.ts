import {CloudWatchLogsClient} from '@aws-sdk/client-cloudwatch-logs';
import {IAMClient} from '@aws-sdk/client-iam';
import {LambdaClient} from '@aws-sdk/client-lambda';
import {S3Client} from '@aws-sdk/client-s3';
import {AwsRegion} from '../pricing/aws-regions';
import {checkCredentials} from './check-credentials';

const _clients: Partial<
	Record<
		AwsRegion,
		Record<
			string,
			Record<string, CloudWatchLogsClient | LambdaClient | S3Client | IAMClient>
		>
	>
> = {};

const getCredentials = () => {
	return process.env.REMOTION_AWS_ACCESS_KEY_ID &&
		process.env.REMOTION_AWS_SECRET_ACCESS_KEY
		? {
				accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY,
		  }
		: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
		  };
};

const getCredentialsKey = () => JSON.stringify(getCredentials());

export const getServiceClient = (
	region: AwsRegion,
	service: 'cloudwatch' | 'lambda' | 's3' | 'iam'
): CloudWatchLogsClient => {
	if (!_clients[region]) {
		_clients[region] = {};
	}

	const Client = (() => {
		if (service === 'cloudwatch') {
			return CloudWatchLogsClient;
		}

		if (service === 'lambda') {
			return LambdaClient;
		}

		if (service === 's3') {
			return S3Client;
		}

		if (service === 'iam') {
			return IAMClient;
		}
	})();

	const key = getCredentialsKey();
	// @ts-expect-error
	if (!_clients[region][key]) {
		// @ts-expect-error
		_clients[region][key] = {};
	}

	// @ts-expect-error
	if (!_clients[region][key][service]) {
		checkCredentials();

		// @ts-expect-error
		_clients[region][key][service] = new Client({
			region,
			credentials: getCredentials(),
		});
	}

	// @ts-expect-error
	return _clients[region][key][service];
};

export const getCloudWatchLogsClient = (
	region: AwsRegion
): CloudWatchLogsClient => {
	return getServiceClient(region, 'cloudwatch') as CloudWatchLogsClient;
};

export const getS3Client = (region: AwsRegion): S3Client => {
	return getServiceClient(region, 's3') as S3Client;
};

export const getLambdaClient = (region: AwsRegion): LambdaClient => {
	return getServiceClient(region, 'lambda') as LambdaClient;
};

export const getIamClient = (region: AwsRegion): IAMClient => {
	return getServiceClient(region, 'iam') as IAMClient;
};
