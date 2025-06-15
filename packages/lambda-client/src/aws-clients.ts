import type {CloudWatchLogsClient} from '@aws-sdk/client-cloudwatch-logs';
import type {IAMClient} from '@aws-sdk/client-iam';
import type {LambdaClient} from '@aws-sdk/client-lambda';
import type {ServiceQuotasClient} from '@aws-sdk/client-service-quotas';
import type {STSClient} from '@aws-sdk/client-sts';
import {getServiceClient} from './get-service-client';
import type {AwsRegion} from './regions';
import type {RequestHandler} from './types';

export const getCloudWatchLogsClient = (
	region: AwsRegion,
	requestHandler?: RequestHandler,
): CloudWatchLogsClient => {
	return getServiceClient({
		region,
		service: 'cloudwatch',
		customCredentials: null,
		forcePathStyle: false,
		requestHandler,
	});
};

export const getLambdaClient = (
	region: AwsRegion,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_timeoutInTest?: number,
	requestHandler?: RequestHandler,
): LambdaClient => {
	return getServiceClient({
		region,
		service: 'lambda',
		customCredentials: null,
		forcePathStyle: false,
		requestHandler,
	});
};

export const getIamClient = (region: AwsRegion, requestHandler?: RequestHandler): IAMClient => {
	return getServiceClient({
		region,
		service: 'iam',
		customCredentials: null,
		forcePathStyle: false,
		requestHandler,
	});
};

export const getServiceQuotasClient = (
	region: AwsRegion,
	requestHandler?: RequestHandler,
): ServiceQuotasClient => {
	return getServiceClient({
		region,
		service: 'servicequotas',
		customCredentials: null,
		forcePathStyle: false,
		requestHandler,
	});
};

export const getStsClient = (region: AwsRegion, requestHandler?: RequestHandler): STSClient => {
	return getServiceClient({
		region,
		service: 'sts',
		customCredentials: null,
		forcePathStyle: false,
		requestHandler,
	});
};
