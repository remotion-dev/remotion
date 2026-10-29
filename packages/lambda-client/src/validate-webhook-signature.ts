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

	const isRawBody = typeof body === 'string' || Buffer.isBuffer(body);

	if (isRawBody && body.length === 0) {
		throw new TypeError(
			"No 'body' was provided to validateWebhookSignature().",
		);
	}

	// The signature covers the exact bytes that were sent. A raw body is
	// hashed as it arrived. A parsed JSON object is serialized first, which
	// only yields the same signature if parsing and serializing round-trips
	// exactly.
	const hmac = Crypto.createHmac('sha512', secret);
	const signature = `sha512=${hmac
		.update(isRawBody ? body : JSON.stringify(body))
		.digest('hex')}`;

	if (!signatureHeader || signatureHeader === 'NO_SECRET_PROVIDED') {
		throw new Error('No webhook signature was provided');
	}

	const matches =
		Buffer.byteLength(signatureHeader) === Buffer.byteLength(signature) &&
		Crypto.timingSafeEqual(
			Buffer.from(signatureHeader),
			Buffer.from(signature),
		);

	if (!matches) {
		throw new Error('Signatures do not match');
	}
};
