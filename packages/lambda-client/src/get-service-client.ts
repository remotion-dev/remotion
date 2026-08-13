import {CloudWatchLogsClient} from '@aws-sdk/client-cloudwatch-logs';
import {IAMClient} from '@aws-sdk/client-iam';
import {LambdaClient} from '@aws-sdk/client-lambda';
import {S3Client} from '@aws-sdk/client-s3';
import {ServiceQuotasClient} from '@aws-sdk/client-service-quotas';
import {STSClient} from '@aws-sdk/client-sts';
import type {CustomCredentials} from '@remotion/serverless-client';
import {MAX_FUNCTIONS_PER_RENDER, random} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {checkCredentials} from './check-credentials';
import {getCredentials} from './get-credentials';
import {getEnvVariable} from './get-env-variable';
import type {RequestHandler} from './types';

export type ServiceMapping = {
	s3: S3Client;
	cloudwatch: CloudWatchLogsClient;
	iam: IAMClient;
	lambda: LambdaClient;
	servicequotas: ServiceQuotasClient;
	sts: STSClient;
};

const getCredentialsHash = ({
	customCredentials,
	region,
	service,
	forcePathStyle,
}: {
	region: string;
	customCredentials: CustomCredentials<AwsProvider> | null;
	service: keyof ServiceMapping;
	forcePathStyle: boolean;
}): string => {
	const hashComponents: {[key: string]: unknown} = {};

	if (getEnvVariable('REMOTION_SKIP_AWS_CREDENTIALS_CHECK')) {
		hashComponents.credentials = {
			credentialsSkipped: true,
		};
	} else if (getEnvVariable('REMOTION_AWS_PROFILE')) {
		hashComponents.credentials = {
			awsProfile: getEnvVariable('REMOTION_AWS_PROFILE'),
		};
	} else if (
		getEnvVariable('REMOTION_AWS_ACCESS_KEY_ID') &&
		getEnvVariable('REMOTION_AWS_SECRET_ACCESS_KEY')
	) {
		hashComponents.credentials = {
			accessKeyId: getEnvVariable('REMOTION_AWS_ACCESS_KEY_ID'),
			secretAccessKey: getEnvVariable('REMOTION_AWS_SECRET_ACCESS_KEY'),
		};
	} else if (getEnvVariable('AWS_PROFILE')) {
		hashComponents.credentials = {
			awsProfile: getEnvVariable('AWS_PROFILE'),
		};
	} else if (
		getEnvVariable('AWS_ACCESS_KEY_ID') &&
		getEnvVariable('AWS_SECRET_ACCESS_KEY')
	) {
		hashComponents.credentials = {
			accessKeyId: getEnvVariable('AWS_ACCESS_KEY_ID') as string,
			secretAccessKey: getEnvVariable('AWS_SECRET_ACCESS_KEY') as string,
		};
	}

	hashComponents.customCredentials = customCredentials;
	hashComponents.region = region;
	hashComponents.service = service;
	hashComponents.forcePathStyle = forcePathStyle;

	return random(JSON.stringify(hashComponents)).toString().replace('0.', '');
};

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

// Custom handlers cannot be serialized into the cache key; key by identity instead
const _clientsWithCustomHandler = new WeakMap<
	object,
	Partial<Record<string, ServiceMapping[keyof ServiceMapping]>>
>();

const getCustomHandlerClientCache = (requestHandler: object) => {
	const existing = _clientsWithCustomHandler.get(requestHandler);
	if (existing) {
		return existing;
	}

	const created: Partial<Record<string, ServiceMapping[keyof ServiceMapping]>> =
		{};
	_clientsWithCustomHandler.set(requestHandler, created);
	return created;
};

export function getServiceClient<T extends keyof ServiceMapping>({
	region,
	service,
	customCredentials,
	forcePathStyle,
	requestHandler,
}: {
	region: string;
	service: T;
	customCredentials: CustomCredentials<AwsProvider> | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
}): ServiceMapping[T] {
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
		forcePathStyle,
	});

	const cache = requestHandler
		? getCustomHandlerClientCache(requestHandler)
		: _clients;

	if (!cache[key]) {
		checkCredentials();

		const lambdaOptions =
			service === 'lambda'
				? {
						httpsAgent: {
							maxSockets: MAX_FUNCTIONS_PER_RENDER * 2,
						},
					}
				: undefined;

		// Spreading a handler instance (e.g. NodeHttpHandler) would strip its prototype
		const finalRequestHandler = requestHandler ?? lambdaOptions;

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
					requestHandler: finalRequestHandler,
					forcePathStyle: customCredentials.forcePathStyle,
					maxAttempts: service === 'lambda' ? 1 : undefined,
				})
			: getEnvVariable('REMOTION_SKIP_AWS_CREDENTIALS_CHECK')
				? new Client({
						region,
						requestHandler: finalRequestHandler,
						maxAttempts: service === 'lambda' ? 1 : undefined,
					})
				: new Client({
						region,
						credentials: getCredentials(),
						requestHandler: finalRequestHandler,
						maxAttempts: service === 'lambda' ? 1 : undefined,
					});

		if (getEnvVariable('REMOTION_DISABLE_AWS_CLIENT_CACHE')) {
			return client as ServiceMapping[T];
		}

		cache[key] = client;
	}

	return cache[key] as ServiceMapping[T];
}
