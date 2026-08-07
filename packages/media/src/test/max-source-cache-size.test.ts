import {afterEach, expect, test, vi} from 'vitest';

const MIB = 1024 * 1024;

const loadWithBudget = (mediaCacheSizeInBytes: number | null) => {
	// The budget is memoized after the first read, so the module has to be
	// re-imported for every scenario.
	vi.resetModules();
	vi.stubGlobal('remotion_mediaCacheSizeInBytes', mediaCacheSizeInBytes);
	vi.stubGlobal('remotion_initialMemoryAvailable', null);

	return import('../max-cache-size');
};

afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetModules();
});

test('the default budget keeps the source cache near the mediabunny default', async () => {
	const {getMaxSourceCacheSize} = await loadWithBudget(null);

	// Falls back to the 1GB default, /16 = 62.5 MB, just under the 64 MiB
	// mediabunny would have used on its own.
	expect(getMaxSourceCacheSize('info')).toBe(
		Math.floor((1000 * 1000 * 1000) / 16),
	);
	expect(getMaxSourceCacheSize('info')).toBeLessThan(64 * MIB);
});

test('a small configured budget shrinks the source cache', async () => {
	const {getMaxSourceCacheSize} = await loadWithBudget(240 * MIB);

	expect(getMaxSourceCacheSize('info')).toBe(15 * MIB);
});

test('a large configured budget is capped at the mediabunny default', async () => {
	const {getMaxSourceCacheSize} = await loadWithBudget(20_000 * MIB);

	expect(getMaxSourceCacheSize('info')).toBe(64 * MIB);
});

test('the smallest permitted budget still clears the floor', async () => {
	// 240MB is the smallest value `mediaCacheSizeInBytes` accepts, so the 8 MiB
	// floor is defensive rather than reachable through this path.
	const {getMaxSourceCacheSize} = await loadWithBudget(240 * MIB);

	expect(getMaxSourceCacheSize('info')).toBeGreaterThanOrEqual(8 * MIB);
});
