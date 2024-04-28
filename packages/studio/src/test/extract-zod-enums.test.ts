import {expect, test} from 'bun:test';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {z} from 'zod';
import {extractEnumJsonPaths} from '../components/RenderModal/SchemaEditor/extract-enum-json-paths';

test('Extract Zod enums', () => {
	expect(
		extractEnumJsonPaths(
			z.object({
				enums: z.enum(['a', 'b', 'c']),
			}),
			z,
			[],
		),
	).toStrictEqual([['enums']]);
});

test('Extract Zod enums #2', () => {
	expect(
		extractEnumJsonPaths(
			z.object({
				enums: z.enum(['a', 'b', 'c']),
				nested: z.object({
					second: z.enum(['a', 'b', 'c']),
				}),
				arrays: z.array(z.enum(['a', 'b', 'c'])),
				union: z.object({hi: z.enum(['a'])}).or(z.object({abc: z.enum(['b'])})),
				discriminatedUnion: z
					.discriminatedUnion('status', [
						z.object({status: z.literal('failed'), error: z.enum(['yo'])}),
						z.object({status: z.literal('success'), data: z.enum(['ya'])}),
					])
					.refine((x) => x.status === 'success', {path: ['status']}),
				intersection: z.intersection(
					z.object({a: z.enum(['a'])}),
					z.object({b: z.enum(['b'])}),
				),
				tuples: z.tuple([z.enum(['a']), z.enum(['b'])]).optional(),
				abc: z
					.record(z.enum(['a', 'b', 'c']))
					.nullable()
					.default({}),
				branded: z.object({a: z.enum(['a'])}).brand('branded'),
			}),
			z,
			[],
		),
	).toStrictEqual([
		['enums'],
		['nested', 'second'],
		['arrays', '[]'],
		['union', 'hi'],
		['union', 'abc'],
		['discriminatedUnion', 'status'],
		['discriminatedUnion', 'error'],
		['discriminatedUnion', 'status'],
		['discriminatedUnion', 'data'],
		['intersection', 'a'],
		['intersection', 'b'],
		['tuples', 0],
		['tuples', 1],
		['abc', '{}'],
		['branded', 'a'],
	]);
});
