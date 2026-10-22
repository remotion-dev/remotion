import {expect, test} from 'bun:test';
import {
	resolveBrowserStudioRemotionPackage,
	type BrowserStudioWorkspacePackageExports,
} from '../workspace-package-exports';

const packages: BrowserStudioWorkspacePackageExports = {
	'@remotion/timeline-utils': {
		exports: {'.': './dist/esm/index.mjs'},
		packageRoot: 'packages/timeline-utils',
	},
	remotion: {
		exports: {'.': './dist/esm/index.mjs'},
		packageRoot: 'packages/core',
	},
};

test('resolves workspace and release artifacts without registry fallback', () => {
	expect(
		resolveBrowserStudioRemotionPackage({
			packages,
			request: '@remotion/timeline-utils',
			source: {
				baseUrl: 'https://assets.example.com/commits/abc123/',
				commit: 'abc123',
				type: 'workspace',
			},
		}),
	).toBe(
		'https://assets.example.com/commits/abc123/packages/timeline-utils/dist/esm/index.mjs',
	);
	expect(
		resolveBrowserStudioRemotionPackage({
			packages,
			request: 'remotion',
			source: {
				baseUrl: 'https://assets.example.com/releases/4.0.514/',
				type: 'release',
				version: '4.0.514',
			},
		}),
	).toBe(
		'https://assets.example.com/releases/4.0.514/packages/core/dist/esm/index.mjs',
	);
	expect(
		resolveBrowserStudioRemotionPackage({
			packages,
			request: 'react',
			source: {
				baseUrl: 'https://assets.example.com/commits/abc123/',
				commit: 'abc123',
				type: 'workspace',
			},
		}),
	).toBeNull();
	expect(() =>
		resolveBrowserStudioRemotionPackage({
			packages,
			request: '@remotion/not-in-this-build',
			source: {
				baseUrl: 'https://assets.example.com/commits/abc123/',
				commit: 'abc123',
				type: 'workspace',
			},
		}),
	).toThrow('Refusing to fall back to the package registry');
});
