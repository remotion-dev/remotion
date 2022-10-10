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
export function calculateSignature(payload: string, secret?: string) {
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

/**
 * @description Calls a webhook.
 * @link https://remotion.dev/docs/lambda/rendermediaonlambda#webhook
 * @param params.url URL of webhook to call.
 * @param params.renderId assigned render ID.
 * @param params.secret webhook secret provided by the user.
 * @param params.bucketName S3 bucket name.
 * @param params.expectedBucketOwner owner of S3 bucket.
 * @param params.outputUrl URL of rendered media file.
 * @param params.lambdaErrors non-fatal errors that have occurred during the render process.
 * @param params.errors fatal errors that have been thrown during the render process.
 * @param params.outputFile output file.
 * @param params.timeToFinish time to finish of rendering process.
 * @returns {Promise<void>} Promise of HTTP request with resolve/reject to be used for error handling.
 */
export function invokeWebhook({
	payload,
	secret,
	url,
}: {
	payload: WebhookPayload;
	url: string;
	secret: string | undefined;
}) {
	return new Promise<void>((resolve, reject) => {
		const req = getWebhookClient(url)(
			url,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Remotion-Mode': 'production',
					'X-Remotion-Signature': calculateSignature(
						JSON.stringify(payload),
						secret
					),
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

		req.write(payload);

		req.on('error', (err) => {
			reject(err);
		});

		req.end();
	});
}
