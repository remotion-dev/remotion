import type {
	WebhookErrorPayload,
	WebhookPayload,
	WebhookSuccessPayload,
	WebhookTimeoutPayload,
} from '@remotion/serverless-client';
import {validateWebhookSignature} from './validate-webhook-signature';

export type NextWebhookArgs = {
	testing?: boolean;
	extraHeaders?: Record<string, string>;
	secret: string;
	onSuccess?: (payload: WebhookSuccessPayload) => void;
	onTimeout?: (payload: WebhookTimeoutPayload) => void;
	onError?: (payload: WebhookErrorPayload) => void;
};

export const appRouterWebhook = (
	options: NextWebhookArgs,
): ((req: Request) => Promise<Response>) => {
	const {testing, extraHeaders, secret, onSuccess, onTimeout, onError} =
		options;
	return async function (req: Request): Promise<Response> {
		let headers = extraHeaders || {};

		if (testing) {
			const testingheaders = {
				'Access-Control-Allow-Origin': 'https://www.remotion.dev',
				'Access-Control-Allow-Headers':
					'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Remotion-Status, X-Remotion-Signature, X-Remotion-Mode',
				'Access-Control-Allow-Methods': 'OPTIONS,POST',
			};
			headers = {...headers, ...testingheaders};
		}

		if (req.method === 'OPTIONS') {
			//  do we have any use of the OPTIONS method other than the tester on webhooks page ? if so we can add a condition here to only return this if testing mode enabled
			return new Response(null, {
				headers,
			});
		}

		// Parse the body properly
		const body = await req.json();

		validateWebhookSignature({
			secret,
			body,
			signatureHeader: req.headers.get('X-Remotion-Signature') as string,
		});

		const payload = body as WebhookPayload;

		if (payload.type === 'success' && onSuccess) {
			onSuccess(payload);
		} else if (payload.type === 'timeout' && onTimeout) {
			onTimeout(payload);
		} else if (payload.type === 'error' && onError) {
			onError(payload);
		}

		return new Response(JSON.stringify({success: true}), {headers});
	};
};
