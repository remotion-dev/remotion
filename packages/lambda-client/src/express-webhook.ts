import type {Request, Response} from 'express';
import type {NextWebhookArgs} from './app-router-webhook';
import {addHeaders} from './pages-router-webhook';
import {validateWebhookSignature} from './validate-webhook-signature';

export const expressWebhook = (options: NextWebhookArgs) => {
	const {testing, extraHeaders, secret, onSuccess, onTimeout, onError} =
		options;
	return (req: Request, res: Response) => {
		//  add headers to enable  testing
		if (testing) {
			const testingheaders = {
				'Access-Control-Allow-Origin': 'https://www.remotion.dev',
				'Access-Control-Allow-Headers':
					'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Remotion-Status, X-Remotion-Signature, X-Remotion-Mode',
				'Access-Control-Allow-Methods': 'OPTIONS,POST',
			};
			addHeaders(res, testingheaders);
		}

		//  add extra headers
		addHeaders(res, extraHeaders || {});

		// dont go forward if just testing
		if (req.method === 'OPTIONS') {
			res.status(200).end();
			return;
		}

		// validate the webhook signature
		validateWebhookSignature({
			signatureHeader: req.header('X-Remotion-Signature') as string,
			body: req.body,
			secret,
		});

		//  custom logic
		const payload = req.body;
		if (payload.type === 'success' && onSuccess) {
			onSuccess(payload);
		} else if (payload.type === 'error' && onError) {
			onError(payload);
		} else if (payload.type === 'timeout' && onTimeout) {
			onTimeout(payload);
		}

		// send response
		res.status(200).json({success: true});
	};
};
