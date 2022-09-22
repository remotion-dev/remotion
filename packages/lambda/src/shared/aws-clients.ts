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
		string,
		| CloudWatchLogsClient
		| LambdaClient
		| S3Client
		| IAMClient
		| ServiceQuotasClient
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

const getKey = ({
	credentials,
	customCredentials,
	region,
	service,
}: {
	credentials: CredentialPair | null;
	region: AwsRegion;
	customCredentials: CustomCredentials | null;
	service: keyof ServiceMapping;
}) =>
	[
		credentials?.accessKeyId,
		credentials?.secretAccessKey,
		customCredentials?.accessKeyId,
		customCredentials?.endpoint,
		customCredentials?.secretAccessKey,
		region,
		service,
	].join('-');

export type ServiceMapping = {
	s3: S3Client;
	cloudwatch: CloudWatchLogsClient;
	iam: IAMClient;
	lambda: LambdaClient;
	servicequotas: ServiceQuotasClient;
};

export type CustomCredentialsWithoutSensitiveData = {
	endpoint: string;
};

export type CustomCredentials = CustomCredentialsWithoutSensitiveData & {
	accessKeyId: string | null;
	secretAccessKey: string | null;
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

		throw new TypeError('unknown client ' + service);
	})();

	const key = getKey({
		credentials: getCredentials() ?? null,
		region,
		customCredentials,
		service,
	});

	if (!_clients[key]) {
		checkCredentials();

		if (customCredentials) {
			_clients[key] = new Client({
				region: 'us-east-1',
				credentials:
					customCredentials.accessKeyId && customCredentials.secretAccessKey
						? {
								accessKeyId: customCredentials.accessKeyId,
								secretAccessKey: customCredentials.secretAccessKey,
						  }
						: undefined,
				endpoint: customCredentials.endpoint,
			});
		} else {
			_clients[key] = new Client({
				region,
				credentials: getCredentials(),
			});
		}
	}

	return _clients[key] as ServiceMapping[T];
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
