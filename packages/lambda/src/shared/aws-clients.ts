import {CloudWatchLogsClient} from '@aws-sdk/client-cloudwatch-logs';
import {IAMClient} from '@aws-sdk/client-iam';
import {LambdaClient} from '@aws-sdk/client-lambda';
import {S3Client} from '@aws-sdk/client-s3';
import {ServiceQuotasClient} from '@aws-sdk/client-service-quotas';
import {STSClient} from '@aws-sdk/client-sts';
import {fromIni} from '@aws-sdk/credential-providers';
import {Agent} from 'https';
import {random} from 'remotion/no-react';
import {NodeHttpHandler} from '../functions/helpers/http-handler/custom-handler';
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
		| STSClient
	>
> = {};

type CredentialPair = {
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
};
type AwsCredentialIdentityProvider = ReturnType<typeof fromIni>;

const getCredentials = ():
	| CredentialPair
	| AwsCredentialIdentityProvider
	| undefined => {
	if (isInsideLambda()) {
		return undefined;
	}

	if (process.env.REMOTION_AWS_PROFILE) {
		return fromIni({
			profile: process.env.REMOTION_AWS_PROFILE,
		});
	}

	if (
		process.env.REMOTION_AWS_ACCESS_KEY_ID &&
		process.env.REMOTION_AWS_SECRET_ACCESS_KEY &&
		process.env.REMOTION_AWS_SESSION_TOKEN
	) {
		return {
			accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY,
			sessionToken: process.env.REMOTION_AWS_SESSION_TOKEN,
		};
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

	if (process.env.AWS_PROFILE) {
		return fromIni({
			profile: process.env.AWS_PROFILE,
		});
	}

	if (
		process.env.AWS_ACCESS_KEY_ID &&
		process.env.AWS_SECRET_ACCESS_KEY &&
		process.env.AWS_SESSION_TOKEN
	) {
		return {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
			sessionToken: process.env.AWS_SESSION_TOKEN as string,
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

const getCredentialsHash = ({
	customCredentials,
	region,
	service,
}: {
	region: AwsRegion;
	customCredentials: CustomCredentials | null;
	service: keyof ServiceMapping;
}): string => {
	const hashComponents: {[key: string]: unknown} = {};

	if (process.env.REMOTION_SKIP_AWS_CREDENTIALS_CHECK) {
		hashComponents.credentials = {
			credentialsSkipped: true,
		};
	} else if (process.env.REMOTION_AWS_PROFILE) {
		hashComponents.credentials = {
			awsProfile: process.env.REMOTION_AWS_PROFILE,
		};
	} else if (
		process.env.REMOTION_AWS_ACCESS_KEY_ID &&
		process.env.REMOTION_AWS_SECRET_ACCESS_KEY
	) {
		hashComponents.credentials = {
			accessKeyId: process.env.REMOTION_AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.REMOTION_AWS_SECRET_ACCESS_KEY,
		};
	} else if (process.env.AWS_PROFILE) {
		hashComponents.credentials = {
			awsProfile: process.env.AWS_PROFILE,
		};
	} else if (
		process.env.AWS_ACCESS_KEY_ID &&
		process.env.AWS_SECRET_ACCESS_KEY
	) {
		hashComponents.credentials = {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
		};
	}

	hashComponents.customCredentials = customCredentials;
	hashComponents.region = region;
	hashComponents.service = service;

	return random(JSON.stringify(hashComponents)).toString().replace('0.', '');
};

export type ServiceMapping = {
	s3: S3Client;
	cloudwatch: CloudWatchLogsClient;
	iam: IAMClient;
	lambda: LambdaClient;
	servicequotas: ServiceQuotasClient;
	sts: STSClient;
};

export type CustomCredentialsWithoutSensitiveData = {
	endpoint: string;
};

export type CustomCredentials = CustomCredentialsWithoutSensitiveData & {
	accessKeyId: string | null;
	secretAccessKey: string | null;
	region?: AwsRegion;
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

		if (service === 'sts') {
			return STSClient;
		}

		throw new TypeError('unknown client ' + service);
	})();

	const key = getCredentialsHash({
		region,
		customCredentials,
		service,
	});

	if (!_clients[key]) {
		checkCredentials();

		const lambdaOptions =
			service === 'lambda'
				? new NodeHttpHandler({
						httpsAgent: new Agent({
							keepAlive: true,
							maxSockets: 300, // default is 50 per client.
						}),

						// time limit (ms) for receiving response.
						requestTimeout: 30_000,

						// time limit (ms) for establishing connection.
						connectionTimeout: 6_000,
					})
				: undefined;

		const client = customCredentials
			? new Client({
					region: customCredentials.region ?? 'us-east-1',
					credentials:
						customCredentials.accessKeyId && customCredentials.secretAccessKey
							? {
									accessKeyId: customCredentials.accessKeyId,
									secretAccessKey: customCredentials.secretAccessKey,
								}
							: undefined,
					endpoint: customCredentials.endpoint,
					requestHandler: lambdaOptions,
				})
			: process.env.REMOTION_SKIP_AWS_CREDENTIALS_CHECK
				? new Client({
						region,
						requestHandler: lambdaOptions,
					})
				: new Client({
						region,
						credentials: getCredentials(),
						requestHandler: lambdaOptions,
					});

		if (process.env.REMOTION_DISABLE_AWS_CLIENT_CACHE) {
			return client as ServiceMapping[T];
		}

		_clients[key] = client;
	}

	return _clients[key] as ServiceMapping[T];
};

export const getCloudWatchLogsClient = (
	region: AwsRegion,
): CloudWatchLogsClient => {
	return getServiceClient({
		region,
		service: 'cloudwatch',
		customCredentials: null,
	});
};

export const getS3Client = (
	region: AwsRegion,
	customCredentials: CustomCredentials | null,
): S3Client => {
	return getServiceClient({
		region: customCredentials?.region ?? region,
		service: 's3',
		customCredentials,
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
