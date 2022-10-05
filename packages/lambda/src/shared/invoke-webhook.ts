import * as Crypto from 'crypto';
import http from 'http';
import https from 'https';

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

const getWebhookClient = (url: string) => {
	if (url.startsWith('https://')) {
		return mockableHttpClients.https;
	}

	if (url.startsWith('http://')) {
		return mockableHttpClients.http;
	}

	throw new Error('Can only request URLs starting with http:// or https://');
};

export const mockableHttpClients = {
	http: http.request,
	https: https.request,
};

/**
 * @description Calls a webhook.
 * @link https://remotion.dev/docs/lambda/rendermediaonlambda#webhook
 * @param params.url URL of webhook to call.
 */
export function invokeWebhook({url, type, renderId}: InvokeWebhookInput) {
	const payload = JSON.stringify({result: type, renderId});

	return new Promise<void>((resolve, reject) => {
		const req = getWebhookClient(url)(
			url,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Remotion-Signature': calculateSignature(payload),
					'X-Remotion-Status': type,
				},
			},
			(res) => {
				if (res.statusCode && res.statusCode > 299) {
					reject(
						new Error(
							`Sent a webhook but got a status code of ${res.statusCode}`
						)
					);
					return;
				}

				resolve();
			}
		);

		req.on('error', (err) => {
			reject(err);
		});

		req.write(payload);

		req.end();
	});
}
