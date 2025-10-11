import type {AfterRenderCost} from './constants';
import type {EnhancedErrorInfo} from './write-error-to-storage';

type StaticWebhookPayload = {
	renderId: string;
	expectedBucketOwner: string;
	bucketName: string;
	customData: Record<string, unknown> | null;
};

export type WebhookErrorPayload = StaticWebhookPayload & {
	type: 'error';
	errors: {
		message: string;
		name: string;
		stack: string;
	}[];
};

export type WebhookSuccessPayload = StaticWebhookPayload & {
	type: 'success';
	lambdaErrors: EnhancedErrorInfo[];
	outputUrl: string | undefined;
	outputFile: string | undefined;
	timeToFinish: number | undefined;
	costs: AfterRenderCost;
};

export type WebhookTimeoutPayload = StaticWebhookPayload & {
	type: 'timeout';
};

export type WebhookPayload =
	| WebhookErrorPayload
	| WebhookSuccessPayload
	| WebhookTimeoutPayload;
