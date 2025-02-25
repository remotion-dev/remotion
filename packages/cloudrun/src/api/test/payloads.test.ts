import {expect, test} from 'bun:test';
import type {z} from 'zod';
import {CloudRunPayload} from '../../functions/helpers/payloads';

test('CloudRunPayload should work with and without optional webhook fields', () => {
	const basePayload = {
		type: 'still' as const,
		serveUrl: 'https://example.com',
		composition: 'my-comp',
		imageFormat: 'png' as const,
		scale: 1,
		privacy: 'public' as const,
		envVariables: {},
		outputBucket: 'my-bucket',
		frame: 0,
		delayRenderTimeoutInMilliseconds: 30000,
		logLevel: 'info' as const,
		clientVersion: '1.0.0',
		downloadBehavior: {type: 'play-in-browser' as const},
		outName: null,
		offthreadVideoCacheSizeInBytes: null,
		offthreadVideoThreads: null,
		serializedInputPropsWithCustomSchema: JSON.stringify({}),
	};

	const withWebhook: z.infer<typeof CloudRunPayload> = {
		...basePayload,
		renderIdOverride: 'custom-render-id',
		renderStatusWebhook: {
			url: 'https://webhook.example.com',
			headers: {'x-custom-header': 'value'},
			data: {key: 'value'},
		},
	};

	const withoutWebhook = basePayload;

	const parsedWithWebhook = CloudRunPayload.safeParse(withWebhook);
	const parsedWithoutWebhook = CloudRunPayload.safeParse(withoutWebhook);

	expect(parsedWithWebhook.success).toBe(true);
	expect(parsedWithoutWebhook.success).toBe(true);

	if (parsedWithWebhook.success) {
		expect(parsedWithWebhook.data.renderIdOverride).toBe('custom-render-id');
		expect(parsedWithWebhook.data.renderStatusWebhook).toEqual({
			url: 'https://webhook.example.com',
			headers: {'x-custom-header': 'value'},
			data: {key: 'value'},
		});
	}

	if (parsedWithoutWebhook.success) {
		expect(parsedWithoutWebhook.data.renderIdOverride).toBeUndefined();
		expect(parsedWithoutWebhook.data.renderStatusWebhook).toBeUndefined();
	}
});
