import {expect, test} from 'bun:test';
import {extractTweetId} from '~/lib/extract-tweet-id';

test('extracts tweet IDs from x.com URLs', () => {
	expect(
		extractTweetId('https://x.com/JNYBGR/status/1859650265021817143'),
	).toBe('1859650265021817143');
	expect(
		extractTweetId('https://mobile.x.com/JNYBGR/statuses/1859650265021817143'),
	).toBe('1859650265021817143');
	expect(
		extractTweetId(
			'https://x.com/JNYBGR/status/1859650265021817143?s=20&t=abc',
		),
	).toBe('1859650265021817143');
});

test('extracts tweet IDs from twitter.com URLs', () => {
	expect(
		extractTweetId('https://twitter.com/JNYBGR/status/1859650265021817143'),
	).toBe('1859650265021817143');
});

test('returns null when no tweet ID can be extracted', () => {
	expect(extractTweetId('')).toBe(null);
	expect(extractTweetId('https://x.com/JNYBGR')).toBe(null);
	expect(extractTweetId('not a tweet')).toBe(null);
});
