import {expect, test} from 'bun:test';
import {resolveFontSubsetKeys} from '../src/resolve-font-subsets';

test('expands declared CJK subsets to chunk keys', () => {
	expect(
		resolveFontSubsetKeys({
			availableSubsetKeys: ['latin', '[10]', '[2]', '[1]'],
			metaSubsets: ['chinese-simplified', 'latin'],
			requestedSubset: 'chinese-simplified',
		}),
	).toEqual(['[1]', '[2]', '[10]']);
});

test('prefers a direct subset key if one exists', () => {
	expect(
		resolveFontSubsetKeys({
			availableSubsetKeys: ['chinese-traditional', '[1]'],
			metaSubsets: ['chinese-traditional'],
			requestedSubset: 'chinese-traditional',
		}),
	).toEqual(['chinese-traditional']);
});

test('preserves unknown subsets so the loader can throw', () => {
	expect(
		resolveFontSubsetKeys({
			availableSubsetKeys: ['latin', '[1]'],
			metaSubsets: ['chinese-simplified', 'latin'],
			requestedSubset: 'chinese',
		}),
	).toEqual(['chinese']);
});

test('preserves declared CJK subsets if no chunk keys exist', () => {
	expect(
		resolveFontSubsetKeys({
			availableSubsetKeys: ['latin'],
			metaSubsets: ['korean', 'latin'],
			requestedSubset: 'korean',
		}),
	).toEqual(['korean']);
});
