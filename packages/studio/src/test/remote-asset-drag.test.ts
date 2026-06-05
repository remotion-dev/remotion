import {expect, test} from 'bun:test';
import {
	getRemoteAssetUrlFromHtml,
	getRemoteAssetUrlFromUriList,
} from '../helpers/remote-asset-drag';

test('extracts the first HTTP URL from a uri-list', () => {
	expect(
		getRemoteAssetUrlFromUriList(
			'# comment\r\nfile:///tmp/image.png\r\nhttps://example.com/image.png',
		),
	).toBe('https://example.com/image.png');
});

test('extracts image sources from HTML drag data', () => {
	expect(
		getRemoteAssetUrlFromHtml(
			'<a href="https://example.com"><img src="https://img.example.com/photo.jpg?size=large&amp;x=1"></a>',
		),
	).toBe('https://img.example.com/photo.jpg?size=large&x=1');
});

test('falls back to HTTP URLs in HTML drag data', () => {
	expect(
		getRemoteAssetUrlFromHtml('<p>https://example.com/image.webp</p>'),
	).toBe('https://example.com/image.webp');
});
