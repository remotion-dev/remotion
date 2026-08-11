import type {GenericRenderProgress, Privacy} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import type {AwsRegion} from './regions';

export const MIN_MEMORY = 512;
export const MAX_MEMORY = 10240;
export const DEFAULT_MEMORY_SIZE = 2048;

export const DEFAULT_TIMEOUT = 120;
export const MIN_TIMEOUT = 15;
export const MAX_TIMEOUT = 900;

export const DEFAULT_FRAMES_PER_LAMBDA = 20;

export const BINARY_NAME = 'remotion lambda';
export const DEFAULT_REGION: AwsRegion = 'us-east-1';
export const DEFAULT_MAX_RETRIES = 1;

export const MAX_EPHEMERAL_STORAGE_IN_MB = 10240;
// TODO: In V5, Enable set this to 10240
export const DEFAULT_EPHEMERAL_STORAGE_IN_MB = 2048;
export const MIN_EPHEMERAL_STORAGE_IN_MB = 512;

export const DEFAULT_OUTPUT_PRIVACY: Privacy = 'public';

export const DEFAULT_CLOUDWATCH_RETENTION_PERIOD = 14;

export const RENDER_FN_PREFIX = 'remotion-render-';
export const LOG_GROUP_PREFIX = '/aws/lambda/';
export const LAMBDA_INSIGHTS_PREFIX = '/aws/lambda-insights';

export const getSitesKey = (siteId: string) => `sites/${siteId}`;

export type RenderProgress = GenericRenderProgress<AwsProvider>;

export const LAMBDA_CONCURRENCY_LIMIT_QUOTA = 'L-B99A9384';

export const REMOTION_BUCKET_PREFIX = 'remotionlambda-';
