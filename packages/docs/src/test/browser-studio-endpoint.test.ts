import {expect, test} from 'bun:test';
import {getBrowserStudioEndpoint} from '../components/Elements/browser-studio-endpoint';

test('opens Browser Studio on the same Vercel preview deployment', () => {
	expect(
		getBrowserStudioEndpoint({
			hostname:
				'remotion-git-fix-product-collection-duration-remotion.vercel.app',
			origin:
				'https://remotion-git-fix-product-collection-duration-remotion.vercel.app',
		}),
	).toBe(
		'https://remotion-git-fix-product-collection-duration-remotion.vercel.app/experimental_new',
	);
});

test('uses the default Browser Studio outside Vercel previews', () => {
	expect(
		getBrowserStudioEndpoint({
			hostname: 'www.remotion.dev',
			origin: 'https://www.remotion.dev',
		}),
	).toBe(null);
	expect(
		getBrowserStudioEndpoint({
			hostname: 'localhost',
			origin: 'http://localhost:3000',
		}),
	).toBe(null);
});
