import * as Crypto from 'crypto';

/**
 * @description Calculates cryptographically secure signature for webhooks using Hmac.
 * @link https://remotion.dev/docs/lambda/validate-webhooks
 * @param payload Stringified request body to encode in the signature.
 */
export function calculateSignature(payload: string) {
	const secret = 'INSECURE_DEFAULT_SECRET';
	const hmac = Crypto.createHmac('sha1', secret);
	const signature = 'sha1=' + hmac.update(payload).digest('hex');
	return signature;
}

export type InvokeWebhookInput = {
	url: string;
	type: 'success' | 'error' | 'timeout';
	renderId: string;
};

/**
 * @description Calls a webhook.
 * @link https://remotion.dev/docs/lambda/rendermediaonlambda#webhook
 * @param params.url URL of webhook to call.
 */
export async function invokeWebhook({url, type, renderId}: InvokeWebhookInput) {
	const payload = JSON.stringify({result: type, renderId});
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-REMOTION-SIGNATURE': calculateSignature(payload),
			},
			body: payload,
		});
		if (response.status > 299) {
			// do we want to log webhook delivery failures?
		}
	} catch {
		// network error ocurred. Do we log this?
	}
}
