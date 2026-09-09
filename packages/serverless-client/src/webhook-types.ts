import type {AfterRenderCost} from './constants';
import type {EnhancedErrorInfo} from './write-error-to-storage';

type StaticWebhookPayload<BucketOwner extends string | null> = {
	renderId: string;
	expectedBucketOwner: BucketOwner;
	bucketName: string;
	customData: Record<string, unknown> | null;
};

export type WebhookErrorPayload<BucketOwner extends string | null = string> =
	StaticWebhookPayload<BucketOwner> & {
		type: 'error';
		errors: {
			message: string;
			name: string;
			stack: string;
		}[];
	};

export type WebhookSuccessPayload<BucketOwner extends string | null = string> =
	StaticWebhookPayload<BucketOwner> & {
		type: 'success';
		lambdaErrors: EnhancedErrorInfo[];
		outputUrl: string | undefined;
		outputFile: string | undefined;
		timeToFinish: number | undefined;
		costs: AfterRenderCost;
	};

export type WebhookTimeoutPayload<BucketOwner extends string | null = string> =
	StaticWebhookPayload<BucketOwner> & {
		type: 'timeout';
	};

export type WebhookPayload<BucketOwner extends string | null = string> =
	| WebhookErrorPayload<BucketOwner>
	| WebhookSuccessPayload<BucketOwner>
	| WebhookTimeoutPayload<BucketOwner>;
