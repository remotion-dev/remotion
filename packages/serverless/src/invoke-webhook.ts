import {RenderInternals} from '@remotion/renderer';
import * as Crypto from 'node:crypto';
import type {
	InvokeWebhook,
	InvokeWebhookOptions,
} from './provider-implementation';

export function calculateSignature(payload: string, secret: string | null) {
	if (!secret) {
		return 'NO_SECRET_PROVIDED';
	}

	const hmac = Crypto.createHmac('sha512', secret);
	const signature = 'sha512=' + hmac.update(payload).digest('hex');
	return signature;
}

async function invokeWebhookRaw({
	payload,
	secret,
	url,
}: InvokeWebhookOptions): Promise<void> {
	const jsonPayload = JSON.stringify(payload);

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': String(jsonPayload.length),
			'X-Remotion-Mode': 'production',
			'X-Remotion-Signature': calculateSignature(jsonPayload, secret),
			'X-Remotion-Status': payload.type,
		},
		body: jsonPayload,
		signal: AbortSignal.timeout(10_000),
		redirect: 'follow',
	});

	if (!res.ok) {
		throw new Error(
			`Failed to send webhook to ${url}, got status code ${res.status}`,
		);
	}
}

function exponentialBackoff(errorCount: number): number {
	return 1000 * 2 ** (errorCount - 1);
}

export const invokeWebhook: InvokeWebhook = async ({
	options,
	logLevel,
	retries = 2,
	errors = 0,
}) => {
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

		return invokeWebhook({
			options,
			logLevel,
			retries: retries - 1,
			errors: errors + 1,
		});
	}
};
