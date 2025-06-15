import {expect, test} from 'bun:test';
import {IgnorePackFileCacheWarningsPlugin} from '../ignore-packfilecache-warnings';

test('IgnorePackFileCacheWarningsPlugin should filter PackFileCacheStrategy warnings', () => {
	const plugin = new IgnorePackFileCacheWarningsPlugin();

	// Should filter out the target warning
	const targetWarning = new Error(
		'[webpack.cache.PackFileCacheStrategy] Serializing big strings (917kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)',
	);
	expect(plugin.filter(targetWarning)).toBe(false);

	// Should allow other warnings through
	const otherWarning = new Error('Some other webpack warning');
	expect(plugin.filter(otherWarning)).toBe(true);

	// Should allow warnings with similar but not exact text
	const similarWarning = new Error(
		'[webpack.cache.SomeOtherStrategy] Serializing big strings',
	);
	expect(plugin.filter(similarWarning)).toBe(true);
});
