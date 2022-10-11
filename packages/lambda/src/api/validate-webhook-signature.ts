/**
 * @description Throws if the signature of the finish webhook is missing or inauthentic
 * @link https://remotion.dev/docs/lambda/validate-webhook-signature
 * @param params.secret The secret used for signing the webhook
 * @param params.body The body that was received by the endpoint
 * @param params.signatureHeader The `X-Remotion-Signature` header
 * @returns {void}
 */
export const validateWebhookSignature = ({
	secret,
	body,
	signatureHeader,
}: {
	secret: string;
	body: string;
	signatureHeader: string;
}) => {
	if (!secret) {
		throw new TypeError(
			"No 'secret' was provided to validateWebhookSignature()."
		);
	}

	if (!body) {
		throw new TypeError(
			"No 'body' was provided to validateWebhookSignature()."
		);
	}

	if (typeof require === 'undefined') {
		throw new Error('validateWebhookSignature can only be called from Node.JS');
	}

	const Crypto = require('crypto');

	const hmac = Crypto.createHmac('sha512', secret);
	const signature = `sha512=${hmac.update(JSON.stringify(body)).digest('hex')}`;

	if (!signatureHeader || signatureHeader === 'NO_SECRET_PROVIDED') {
		throw new Error('No webhook signature was provided');
	}

	if (signatureHeader !== signature) {
		throw new Error('Signatures do not match');
	}
};
