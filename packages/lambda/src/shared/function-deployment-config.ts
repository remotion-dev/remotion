import type {Runtime} from '@aws-sdk/client-lambda';
import type {AwsRegion, RuntimePreference} from '@remotion/lambda-client';
import type {HostedLayerRegion} from './hosted-layers';

export const FUNCTION_DEPLOYMENT_CONFIG = {
	handler: 'index.handler',
	runtime: 'nodejs24.x' satisfies Runtime,
	architecture: 'arm64',
	maximumRetryAttempts: 0,
} as const;

export const getRuntimeVersionArn = (region: AwsRegion) =>
	`arn:aws:lambda:${region}::runtime:58a37e8413ed69058c4ac3b1df642118591f17d40def93d6101f867c72cd03c2`;

export type FunctionArtifactManifest = {
	schemaVersion: 1;
	remotionVersion: string;
	region: HostedLayerRegion;
	architecture: string;
	runtime: Runtime;
	handler: string;
	runtimeVersionArn: string;
	maximumRetryAttempts: number;
	code: {
		s3Bucket: string;
		s3Key: string;
		sha256: string;
		sha256Base64: string;
		sizeBytes: number;
	};
	layers: Record<RuntimePreference, string[]>;
};
