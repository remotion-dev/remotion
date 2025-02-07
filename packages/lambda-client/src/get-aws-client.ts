import * as CloudWatchSDK from '@aws-sdk/client-cloudwatch-logs';
import * as IamSdk from '@aws-sdk/client-iam';
import * as LambdaSDK from '@aws-sdk/client-lambda';
import * as S3SDK from '@aws-sdk/client-s3';
import * as ServiceQuotasSDK from '@aws-sdk/client-service-quotas';
import * as StsSdk from '@aws-sdk/client-sts';
import type {CustomCredentials} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {getServiceClient, type ServiceMapping} from './get-service-client';
import type {AwsRegion} from './regions';

export type GetAwsClientInput<T extends keyof ServiceMapping> = {
	region: AwsRegion;
	service: T;
	customCredentials?: CustomCredentials<AwsProvider> | null;
	forcePathStyle?: boolean;
};

type SdkMapping = {
	s3: typeof S3SDK;
	cloudwatch: typeof CloudWatchSDK;
	iam: typeof IamSdk;
	lambda: typeof LambdaSDK;
	servicequotas: typeof ServiceQuotasSDK;
	sts: typeof StsSdk;
};

export type GetAwsClientOutput<T extends keyof ServiceMapping> = {
	client: ServiceMapping[T];
	sdk: SdkMapping[T];
};

/*
 * @description Exposes full access to the AWS SDK used by Remotion, allowing interaction with AWS infrastructure beyond provided functionalities.
 * @see [Documentation](https://remotion.dev/docs/lambda/getawsclient)
 */
export const getAwsClient = <T extends keyof ServiceMapping>({
	region,
	service,
	customCredentials,
	forcePathStyle,
}: GetAwsClientInput<T>): GetAwsClientOutput<T> => {
	return {
		client: getServiceClient({
			region,
			service,
			customCredentials: customCredentials ?? null,
			forcePathStyle: forcePathStyle ?? false,
		}),
		sdk: {
			lambda: LambdaSDK,
			cloudwatch: CloudWatchSDK,
			iam: IamSdk,
			s3: S3SDK,
			servicequotas: ServiceQuotasSDK,
			sts: StsSdk,
		}[service],
	};
};
