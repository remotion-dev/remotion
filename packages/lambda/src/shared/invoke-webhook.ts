import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import https from 'https';
import * as Crypto from 'node:crypto';
import http from 'node:http';
import type {EnhancedErrorInfo} from '../functions/helpers/write-lambda-error';
import type {AfterRenderCost} from './constants';

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
			costs: AfterRenderCost;
	  }
	| {
			type: 'timeout';
	  };

export type WebhookPayload = {
	renderId: string;
	expectedBucketOwner: string;
	bucketName: string;
	customData: Record<string, unknown> | null;
} & DynamicWebhookPayload;

export const mockableHttpClients = {
	http: http.request,
	https: https.request,
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

type InvokeWebhookOptions = {
	payload: WebhookPayload;
	url: string;
	secret: string | null;
};

function invokeWebhookRaw({
	payload,
	secret,
	url,
}: InvokeWebhookOptions): Promise<void> {
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
							`Sent a webhook to ${url} but got a status code of ${res.statusCode} with message '${res.statusMessage}'`,
						),
					);
					return;
				}

				resolve();
			},
		);

		req.write(jsonPayload, (err) => {
			if (err) {
				reject(err);
			} else {
				req.end();
			}
		});

		req.on('error', (err) => {
			reject(err);
		});
	});
}

function exponentialBackoff(errorCount: number): number {
	return 1000 * 2 ** (errorCount - 1);
}

export const invokeWebhook = async (
	options: InvokeWebhookOptions,
	logLevel: LogLevel,
	retries = 2,
	errors = 0,
): Promise<void> => {
	try {
		await invokeWebhookRaw(options);
	} catch (err) {
		if (retries === 0) {
			throw err;
		}

		RenderInternals.Log.error(
			{indent: false, logLevel},
			'Could not send webhook due to error:',
		);
		RenderInternals.Log.error({indent: false, logLevel}, (err as Error).stack);
		RenderInternals.Log.error(
			{indent: false, logLevel},
			`Retrying in ${exponentialBackoff(errors)}ms.`,
		);

		await new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, exponentialBackoff(errors));
		});

		return invokeWebhook(options, logLevel, retries - 1, errors + 1);
	}
};
