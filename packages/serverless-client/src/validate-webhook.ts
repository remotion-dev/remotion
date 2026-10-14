import type {WebhookOption} from './constants';
import {getSizeInBytes} from './get-size-in-bytes';

export const MAX_WEBHOOK_CUSTOM_DATA_SIZE = 1024;

export const validateWebhook = (webhook?: WebhookOption | null) => {
	if (typeof webhook === 'undefined' || webhook === null) {
		return;
	}

	if (webhook.customData) {
		const size = getSizeInBytes(JSON.stringify(webhook.customData));
		if (size > MAX_WEBHOOK_CUSTOM_DATA_SIZE) {
			throw new Error(
				`Webhook "customData" must be less than ${MAX_WEBHOOK_CUSTOM_DATA_SIZE} bytes. Current size: ${size} bytes.`,
			);
		}
	}
};
