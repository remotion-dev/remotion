import {CloudWatchLogsClient} from '@aws-sdk/client-cloudwatch-logs';
import {IAMClient} from '@aws-sdk/client-iam';
import {LambdaClient} from '@aws-sdk/client-lambda';
import {S3Client} from '@aws-sdk/client-s3';
import {ServiceQuotasClient} from '@aws-sdk/client-service-quotas';
import type {AwsRegion} from '../pricing/aws-regions';
import {checkCredentials} from './check-credentials';
import {isInsideLambda} from './is-in-lambda';

const _clients: Partial<
	Record<
		AwsRegion,
		Record<
			string,
			Record<
				string,
				| CloudWatchLogsClient
				| LambdaClient
				| S3Client
				| IAMClient
				| ServiceQuotasClient
			>
		>
	>
> = {};

type CredentialPair = {accessKeyId: string; secretAccessKey: string};

const getCredentials = (): CredentialPair | undefined => {
	if (isInsideLambda()) {
		return undefined;
	}

	if (
		process.env.REMOTION_AWS_ACCESS_KEY_ID &&
		process.env.REMOTION_AWS_SECRET_ACCESS_KEY
	) {
		return {
			accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY,
		};
	}

	if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
		return {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
		};
	}

	return undefined;
};

const getCredentialsKey = () => JSON.stringify(getCredentials());

export type ServiceMapping = {
	s3: S3Client;
	cloudwatch: CloudWatchLogsClient;
	iam: IAMClient;
	lambda: LambdaClient;
	servicequotas: ServiceQuotasClient;
};

export type CustomCredentials = {
	accessKeyId: string;
	secretAccessKey: string;
	endpoint: string;
};

export const getServiceClient = <T extends keyof ServiceMapping>({
	region,
	service,
	customCredentials,
}: {
	region: AwsRegion;
	service: T;
	customCredentials: CustomCredentials | null;
}): ServiceMapping[T] => {
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

		if (service === 'servicequotas') {
			return ServiceQuotasClient;
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

		if (customCredentials) {
			// @ts-expect-error
			_clients[region][key][service] = new Client({
				region,
				credentials: {
					accessKeyId: customCredentials.accessKeyId,
					secretAccessKey: customCredentials.secretAccessKey,
				},
				endpoint: customCredentials.endpoint,
			});
		} else {
			// @ts-expect-error
			_clients[region][key][service] = new Client({
				region,
				credentials: getCredentials(),
			});
		}
	}

	// @ts-expect-error
	return _clients[region][key][service];
};

export const getCloudWatchLogsClient = (
	region: AwsRegion
): CloudWatchLogsClient => {
	return getServiceClient({
		region,
		service: 'cloudwatch',
		customCredentials: null,
	});
};

export const getS3Client = (
	region: AwsRegion,
	customCredentials: CustomCredentials | null
): S3Client => {
	return getServiceClient({region, service: 's3', customCredentials});
};

export const getLambdaClient = (region: AwsRegion): LambdaClient => {
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
	customCredentials: CustomCredentials | null
): ServiceQuotasClient => {
	return getServiceClient({
		region,
		service: 'servicequotas',
		customCredentials,
	});
};
