/*
 * @description Validates that the signature received by a webhook endpoint is authentic. If validation fails, an error is thrown.
 * @see [Documentation](https://remotion.dev/docs/lambda/validatewebhooksignature)
 */
export const validateWebhookSignature = ({
	secret,
	body,
	signatureHeader,
}: {
	secret: string;
	body: unknown;
	signatureHeader: string;
}) => {
	if (!secret) {
		throw new TypeError(
			"No 'secret' was provided to validateWebhookSignature().",
		);
	}

	if (!body) {
		throw new TypeError(
			"No 'body' was provided to validateWebhookSignature().",
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
