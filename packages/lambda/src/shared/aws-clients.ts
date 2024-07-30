import type {CloudWatchLogsClient} from '@aws-sdk/client-cloudwatch-logs';
import type {IAMClient} from '@aws-sdk/client-iam';
import type {LambdaClient} from '@aws-sdk/client-lambda';
import type {ServiceQuotasClient} from '@aws-sdk/client-service-quotas';
import type {STSClient} from '@aws-sdk/client-sts';
import type {AwsRegion} from '../regions';
import {getServiceClient} from './get-service-client';

export const getCloudWatchLogsClient = (
	region: AwsRegion,
): CloudWatchLogsClient => {
	return getServiceClient({
		region,
		service: 'cloudwatch',
		customCredentials: null,
	});
};

export const getLambdaClient = (
	region: AwsRegion,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_timeoutInTest?: number,
): LambdaClient => {
	return getServiceClient({
		region,
		service: 'lambda',
		customCredentials: null,
	});
};

export const getIamClient = (region: AwsRegion): IAMClient => {
	return getServiceClient({region, service: 'iam', customCredentials: null});
};

export const getServiceQuotasClient = (
	region: AwsRegion,
): ServiceQuotasClient => {
	return getServiceClient({
		region,
		service: 'servicequotas',
		customCredentials: null,
	});
};

export const getStsClient = (region: AwsRegion): STSClient => {
	return getServiceClient({region, service: 'sts', customCredentials: null});
};
