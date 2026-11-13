import {expect, test} from 'bun:test';
import {createHmac} from 'node:crypto';
import {expressWebhook} from '../express-webhook';
import {pagesRouterWebhook} from '../pages-router-webhook';

const secret = 'test-secret';
const body = JSON.stringify({
	type: 'success',
	renderId: 'abc',
	expectedBucketOwner: 'owner',
	bucketName: 'bucket',
	customData: null,
});
const signature = `sha512=${createHmac('sha512', secret).update(body).digest('hex')}`;

const makeResponse = () => {
	const res = {
		statusCode: 0,
		json: (_: unknown) => res,
		end: () => res,
		setHeader: () => res,
		status: (code: number) => {
			res.statusCode = code;
			return res;
		},
	};
	return res;
};

const bodies = [
	['a Buffer', Buffer.from(body)],
	['a string', body],
	['a parsed object', JSON.parse(body)],
] as const;

for (const [name, requestBody] of bodies) {
	test(`expressWebhook() calls onSuccess() with ${name} body`, async () => {
		const received: unknown[] = [];
		const handler = expressWebhook({
			secret,
			onSuccess: (payload) => {
				received.push(payload);
			},
		});
		const res = makeResponse();
		await handler(
			{
				method: 'POST',
				body: requestBody,
				header: () => signature,
			} as never,
			res as never,
		);
		expect(res.statusCode).toBe(200);
		expect(received).toEqual([JSON.parse(body)]);
	});

	test(`pagesRouterWebhook() calls onSuccess() with ${name} body`, async () => {
		const received: unknown[] = [];
		const handler = pagesRouterWebhook({
			secret,
			onSuccess: (payload) => {
				received.push(payload);
			},
		});
		const res = makeResponse();
		await handler(
			{
				method: 'POST',
				body: requestBody,
				headers: {'x-remotion-signature': signature},
			} as never,
			res as never,
		);
		expect(res.statusCode).toBe(200);
		expect(received).toEqual([JSON.parse(body)]);
	});
}
