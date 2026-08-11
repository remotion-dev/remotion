import {expect, test} from 'bun:test';
import {createBrowserStudioHmrAssetManager} from '../browser-studio-hmr-assets';

test('serves HMR manifests and script blobs from browser memory', async () => {
	const created: Blob[] = [];
	const revoked: string[] = [];
	const manager = createBrowserStudioHmrAssetManager({
		createObjectUrl: (blob) => {
			created.push(blob);
			return `blob:hmr-${created.length}`;
		},
		revokeObjectUrl: (url) => revoked.push(url),
	});

	manager.updateAssets([
		{
			content: '{"c":["bundle"],"r":[],"m":["changed"]}',
			name: 'bundle.old.hot-update.json',
		},
		{
			content: 'self.rspackHotUpdate("bundle", {changed: true});',
			name: 'bundle.old.hot-update.js',
		},
	]);

	expect(
		await manager.bridge.getManifest(
			'/__remotion_browser_studio_hmr__/bundle.old.hot-update.json',
		),
	).toEqual({c: ['bundle'], r: [], m: ['changed']});
	expect(
		manager.bridge.resolveScriptUrl(
			'https://example.test/bundle.old.hot-update.js',
		),
	).toBe('blob:hmr-1');
	expect(manager.bridge.resolveScriptUrl('bundle.old.hot-update.js')).toBe(
		'blob:hmr-1',
	);
	expect(await created[0].text()).toContain('rspackHotUpdate');

	manager.updateAssets([
		{
			content: 'self.rspackHotUpdate("bundle", {changed: false});',
			name: 'bundle.old.hot-update.js',
		},
	]);
	expect(revoked).toEqual(['blob:hmr-1']);
	expect(manager.bridge.resolveScriptUrl('bundle.old.hot-update.js')).toBe(
		'blob:hmr-2',
	);

	manager.dispose();
	expect(revoked).toEqual(['blob:hmr-1', 'blob:hmr-2']);
});

test('fails clearly when Rspack asks for a missing HMR script', () => {
	const manager = createBrowserStudioHmrAssetManager({
		createObjectUrl: () => 'blob:unused',
		revokeObjectUrl: () => undefined,
	});

	expect(() =>
		manager.bridge.resolveScriptUrl('missing.hot-update.js'),
	).toThrow('Missing Browser Studio HMR asset: missing.hot-update.js');
});
