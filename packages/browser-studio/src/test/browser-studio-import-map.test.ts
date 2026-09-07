import {expect, test} from 'bun:test';
import {
	getBrowserStudioTransformersUrl,
	getBrowserStudioWhisperTransformersUrl,
} from '../browser-studio-import-map';

const localUrl = 'https://studio.test/browser-studio-transformers-entry.mjs';

test('uses the local lazy Transformers bundle by default', () => {
	expect(getBrowserStudioTransformersUrl({localUrl, resolution: null})).toBe(
		localUrl,
	);
});

test('honors custom Transformers URLs', () => {
	expect(
		getBrowserStudioTransformersUrl({
			localUrl,
			resolution: {url: 'https://cdn.test/transformers.mjs'},
		}),
	).toBe('https://cdn.test/transformers.mjs');
	expect(
		getBrowserStudioTransformersUrl({
			localUrl,
			resolution: 'https://cdn.test/transformers-string.mjs',
		}),
	).toBe('https://cdn.test/transformers-string.mjs');
});

test('turns custom Transformers versions into pinned esm.sh URLs', () => {
	expect(
		getBrowserStudioTransformersUrl({
			localUrl,
			resolution: {version: '4.2.0'},
		}),
	).toBe('https://esm.sh/@huggingface/transformers@4.2.0?dev=');
	expect(
		getBrowserStudioTransformersUrl({
			localUrl,
			resolution: '4.1.0',
		}),
	).toBe('https://esm.sh/@huggingface/transformers@4.1.0?dev=');
});

test('uses a separate Transformers module instance for Whisper', () => {
	expect(getBrowserStudioWhisperTransformersUrl(localUrl)).toBe(
		'https://studio.test/browser-studio-transformers-entry.mjs?whisper-webgpu-private=',
	);
});
