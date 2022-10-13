import * as Crypto from 'crypto';
import http from 'http';
import https from 'https';
import type {EnhancedErrorInfo} from '../functions/helpers/write-lambda-error';

/**
 * @description Calculates cryptographically secure signature for webhooks using Hmac.
 * @link https://remotion.dev/docs/lambda/webhooks#validate-webhooks
 * @param payload Stringified request body to encode in the signature.
 * @param secret User-provided webhook secret used to sign the request.
 * @returns {string} Calculated signature
 */
export function calculateSignature(payload: string, secret: string | null) {
	if (!secret) {
		return 'NO_SECRET_PROVIDED';
	}

	const hmac = Crypto.createHmac('sha512', secret);
	const signature = 'sha512=' + hmac.update(payload).digest('hex');
	return signature;
}

type DynamicWebhookPayload =
	| {
			type: 'error';
			errors: {
				message: string;
				name: string;
				stack: string;
			}[];
	  }
	| {
			type: 'success';
			lambdaErrors: EnhancedErrorInfo[];
			outputUrl: string | undefined;
			outputFile: string | undefined;
			timeToFinish: number | undefined;
	  }
	| {
			type: 'timeout';
	  };

export type WebhookPayload = {
	renderId: string;
	expectedBucketOwner: string;
	bucketName: string;
} & DynamicWebhookPayload;

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

export function invokeWebhook({
	payload,
	secret,
	url,
}: {
	payload: WebhookPayload;
	url: string;
	secret: string | null;
}) {
	const jsonPayload = JSON.stringify(payload);
	return new Promise<void>((resolve, reject) => {
		const req = getWebhookClient(url)(
			url,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': jsonPayload.length,
					'X-Remotion-Mode': 'production',
					'X-Remotion-Signature': calculateSignature(jsonPayload, secret),
					'X-Remotion-Status': payload.type,
				},
				timeout: 5000,
			},
			(res) => {
				if (res.statusCode && res.statusCode > 299) {
					reject(
						new Error(
							`Sent a webhook but got a status code of ${res.statusCode} with message '${res.statusMessage}'`
						)
					);
					return;
				}

				resolve();
			}
		);

		req.write(jsonPayload);

		req.on('error', (err) => {
			reject(err);
		});

		req.end();
	});
}
