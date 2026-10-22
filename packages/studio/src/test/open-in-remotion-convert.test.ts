import {expect, test} from 'bun:test';
import {getRemotionConvertUrl} from '../helpers/open-in-remotion-convert';

test('creates a Remotion Convert URL for a Studio asset', () => {
	const url = new URL(
		getRemotionConvertUrl({
			relativePath: 'nested/My Video.mp4',
			studioOrigin: 'http://localhost:3000',
		}),
	);

	expect(url.origin + url.pathname).toBe('https://www.remotion.dev/convert');
	expect(url.searchParams.get('url')).toBe(
		'http://localhost:3000/nested/My%20Video.mp4',
	);
});
