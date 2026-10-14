import {expect, test} from 'bun:test';
import {validateWebhook} from '../validate-webhook';

test('rejects customData over 1024 bytes even if under 1024 characters', () => {
	expect(() =>
		validateWebhook({
			url: 'https://example.com/webhook',
			secret: null,
			customData: {text: '字'.repeat(500)},
		}),
	).toThrow(
		'Webhook "customData" must be less than 1024 bytes. Current size: 1511 bytes.',
	);
});
