import {expect, test} from 'bun:test';
import middleware from '../../middleware';

test('rewrites /elements.md to the Elements overview raw markdown', () => {
	const response = middleware(new Request('https://remotion.dev/elements.md'));

	expect(response).toBeInstanceOf(Response);
	expect(response.headers.get('x-middleware-rewrite')).toBe(
		'https://remotion.dev/_raw/elements/index.md',
	);
});
