import type {LambdaWebhookOption} from '../api/render-media-on-lambda';

export const MAX_WEBHOOK_CUSTOM_DATA_SIZE = 1024;

export const validateWebhook = (webhook?: LambdaWebhookOption | null) => {
	if (typeof webhook === 'undefined' || webhook === null) {
		return;
	}

	if (webhook.customData) {
		const size = JSON.stringify(webhook.customData).length;
		if (size > MAX_WEBHOOK_CUSTOM_DATA_SIZE) {
			throw new Error(
				`Webhook "customData" must be less than ${MAX_WEBHOOK_CUSTOM_DATA_SIZE} bytes. Current size: ${size} bytes.`,
			);
		}
	}
};
