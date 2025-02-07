import type {WebhookPayload} from '@remotion/serverless-client';
import type {Response} from 'express';
import type {NextApiRequest, NextApiResponse} from 'next';
import type {NextWebhookArgs} from './app-router-webhook';
import {validateWebhookSignature} from './validate-webhook-signature';

export const addHeaders = (
	res: NextApiResponse | Response,
	headers: Record<string, string>,
) => {
	Object.entries(headers).forEach(([key, value]) => {
		res.setHeader(key, value);
	});
};

export const pagesRouterWebhook = (options: NextWebhookArgs) => {
	const {testing, extraHeaders, secret, onSuccess, onTimeout, onError} =
		options;
	return function (req: NextApiRequest, res: NextApiResponse): void {
		addHeaders(res, extraHeaders || {});

		if (testing) {
			const testingheaders = {
				'Access-Control-Allow-Origin': 'https://www.remotion.dev',
				'Access-Control-Allow-Headers':
					'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Remotion-Status, X-Remotion-Signature, X-Remotion-Mode',
				'Access-Control-Allow-Methods': 'OPTIONS,POST',
			};

			addHeaders(res, testingheaders);
		}

		if (req.method === 'OPTIONS') {
			res.status(200).end();
			return;
		}

		validateWebhookSignature({
			secret,
			body: req.body,
			signatureHeader: req.headers['x-remotion-signature'] as string,
		});

		// If code reaches this path, the webhook is authentic.
		const payload = req.body as WebhookPayload;
		if (payload.type === 'success' && onSuccess) {
			onSuccess(payload);
		} else if (payload.type === 'timeout' && onTimeout) {
			onTimeout(payload);
		} else if (payload.type === 'error' && onError) {
			onError(payload);
		}

		res.status(200).json({
			success: true,
		});
	};
};
