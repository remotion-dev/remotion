import {z} from 'remotion';
import {expect, test} from 'vitest';
import {createZodValues} from '../editor/components/RenderModal/SchemaEditor/create-zod-values';

test('Should be able to create a string', () => {
	const hi = createZodValues(z.string());
	expect(hi).toBe('');
});

test('Should be able to create a number', () => {
	const hi = createZodValues(z.number());
	expect(hi).toBe(0);
});

test('Should be able to create an object', () => {
	const hi = createZodValues(
		z.object({
			a: z.string(),
			b: z.number(),
		})
	);
	expect(hi).toEqual({a: '', b: 0});
});

test('Should be able to create an array', () => {
	expect(createZodValues(z.array(z.string()))).toEqual(['']);
	expect(createZodValues(z.array(z.number()))).toEqual([0]);
});

test('Should be able to create a union', () => {
	expect(createZodValues(z.union([z.string(), z.number()]))).toBe('');
	expect(createZodValues(z.union([z.number(), z.string()]))).toBe(0);
	// @ts-expect-error union
	expect(createZodValues(z.union([]))).toBe(undefined);
});
