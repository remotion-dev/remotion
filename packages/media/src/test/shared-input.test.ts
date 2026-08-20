import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {Internals} from 'remotion';
import {expect, test} from 'vitest';
import {acquireSharedInput} from '../get-shared-input';

test('shares a main-thread Input acquired outside @remotion/media', async () => {
	const src = 'https://example.com/shared-input.mp4';
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src),
	});
	const studioLease = Internals.globalMediaResourceManager.acquire<Input>({
		key: Internals.getMediabunnyInputResourceKey({
			src,
			credentials: null,
			requestInitFingerprint: null,
			revision: null,
		}),
		create: () => ({resource: input, dispose: () => input.dispose()}),
	});
	const mediaLease = acquireSharedInput({
		src,
		credentials: undefined,
		requestInit: undefined,
		logLevel: 'info',
	});

	expect(mediaLease.input).toBe(studioLease.resource);

	mediaLease.release();
	studioLease.release();
	await Promise.resolve();
	expect(input.disposed).toBe(true);
});
