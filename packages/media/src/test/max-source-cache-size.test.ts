import {expect, test} from 'vitest';
import {
	getMaxSourceCacheSize,
	getMaxSourceCacheSizeFromBudget,
} from '../max-cache-size';

const MIB = 1024 * 1024;

test('the default budget keeps the source cache near the mediabunny default', () => {
	// Falls back to the 1GB default, /16 = 62.5 MB, just under the 64 MiB
	// mediabunny would have used on its own.
	expect(getMaxSourceCacheSize('info')).toBe(
		Math.floor((1000 * 1000 * 1000) / 16),
	);
	expect(getMaxSourceCacheSize('info')).toBeLessThan(64 * MIB);
});

test('a small configured budget shrinks the source cache', () => {
	expect(getMaxSourceCacheSizeFromBudget(240 * MIB)).toBe(15 * MIB);
});

test('a large configured budget is capped at the mediabunny default', () => {
	expect(getMaxSourceCacheSizeFromBudget(20_000 * MIB)).toBe(64 * MIB);
});

test('budgets below the floor are clamped to 8 MiB', () => {
	expect(getMaxSourceCacheSizeFromBudget(MIB)).toBe(8 * MIB);
});
