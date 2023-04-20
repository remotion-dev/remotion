import {zColor} from 'remotion';
import {expect, test} from 'vitest';
import {z} from 'zod';
import {createZodValues} from '../editor/components/RenderModal/SchemaEditor/create-zod-values';

test('Should be able to create a string', () => {
	const hi = createZodValues(z.string(), z);
	expect(hi).toBe('');
});

test('Should be able to create a number', () => {
	const hi = createZodValues(z.number(), z);
	expect(hi).toBe(0);
});

test('Should be able to create an object', () => {
	const hi = createZodValues(
		z.object({
			a: z.string(),
			b: z.number(),
		}),
		z
	);
	expect(hi).toEqual({a: '', b: 0});
});

test('Should be able to create an array', () => {
	expect(createZodValues(z.array(z.string()), z)).toEqual(['']);
	expect(createZodValues(z.array(z.number()), z)).toEqual([0]);
});

test('Should be able to create a union', () => {
	expect(createZodValues(z.union([z.string(), z.number()]), z)).toBe('');
	expect(createZodValues(z.union([z.number(), z.string()]), z)).toBe(0);
	// @ts-expect-error union
	expect(createZodValues(z.union([]))).toBe(undefined);
});

test('Zod literal', () => {
	expect(createZodValues(z.literal('hi'), z)).toBe('hi');
});

test('Should be able to create a discriminated union', () => {
	expect(
		createZodValues(
			z.discriminatedUnion('status', [
				z.object({status: z.literal('success'), data: z.string()}),
				z.object({status: z.literal('failed'), error: z.instanceof(Error)}),
			]),
			z
		)
	).toEqual({status: 'success', data: ''});

	expect(
		createZodValues(
			z.discriminatedUnion('status', [
				z.object({status: z.literal('failed'), error: z.number()}),
				z.object({status: z.literal('success'), data: z.string()}),
			]),
			z
		)
	).toEqual({status: 'failed', error: 0});

	// @ts-expect-error invalid zod type
	expect(() => createZodValues(z.discriminatedUnion('status', []))).toThrow(
		/Invalid zod schema/
	);
});

test('Zod instanceof', () => {
	expect(() => createZodValues(z.instanceof(Error), z)).toThrow(
		/Cannot create a value for type z.any()/
	);
});

test('Zod intersection', () => {
	const Person = z.object({
		name: z.string(),
	});

	const Employee = z.object({
		role: z.string(),
	});

	const EmployedPerson = z.intersection(Person, Employee);
	expect(createZodValues(EmployedPerson, z)).toEqual({
		name: '',
		role: '',
	});
});

test('Zod tuples', () => {
	const Tuple = z.tuple([z.string(), z.number()]);
	expect(createZodValues(Tuple, z)).toEqual(['', 0]);
});

test('Zod record', () => {
	const Record = z.record(z.string());
	expect(createZodValues(Record, z)).toEqual({key: ''});
});

test('Zod map', () => {
	const map = z.map(z.string(), z.number());
	expect(createZodValues(map, z)).toEqual(new Map([['', 0]]));
});

test('Zod lazy', () => {
	const Lazy = z.lazy(() => z.string());
	expect(createZodValues(Lazy, z)).toBe('');
});

test('Zod set', () => {
	const set = z.set(z.string());
	expect(createZodValues(set, z)).toEqual(new Set(['']));
	const set2 = z.set(z.number());
	expect(createZodValues(set2, z)).toEqual(new Set([0]));
});

test('Zod function', () => {
	const fn = z.function();
	expect(() => createZodValues(fn, z)).toThrow(
		/Cannot create a value for type function/
	);
});

test('Zod undefined', () => {
	const undef = z.void();
	expect(createZodValues(undef, z)).toBe(undefined);
});

test('Zod null', () => {
	const undef = z.null();
	expect(createZodValues(undef, z)).toBe(null);
});

test('Zod enum', () => {
	const Enum = z.enum(['a', 'b']);
	expect(createZodValues(Enum, z)).toBe('a');
});

test('Zod nativeEnum', () => {
	enum Fruits {
		Apple,
		Banana,
	}
	const Enum = z.nativeEnum(Fruits);
	expect(createZodValues(Enum, z)).toBe(Fruits.Apple);
});

test('Zod optional', () => {
	const Optional = z.string().optional();
	expect(createZodValues(Optional, z)).toBe('');
});

test('Zod nullable', () => {
	const Nullable = z.string().nullable();
	expect(createZodValues(Nullable, z)).toBe('');
});

test('Zod undefined', () => {
	const undef = z.string().default('tuna');
	expect(createZodValues(undef, z)).toBe('tuna');
});

test('Zod catch', () => {
	const undef = z.string().catch('tuna');
	expect(createZodValues(undef, z)).toBe('');
});

test('Zod promise', () => {
	const undef = z.string().promise();
	(createZodValues(undef, z) as Promise<unknown>).then((v) => {
		expect(v).toBe('');
	});
});

test('Zod transform', () => {
	// Intentional: We don't parse the Zod values, so we should not transform them
	const undef = z.literal('abc').transform((v) => v.toUpperCase());
	expect(createZodValues(undef, z)).toBe('abc');
});

test('Zod branded', () => {
	const Cat = z.object({name: z.string()}).brand<'Cat'>();
	expect(createZodValues(Cat, z)).toEqual({name: ''});
});

test('Zod lazy', () => {
	const datelike = z.union([z.number(), z.string(), z.date()]);
	const datelikeToDate = datelike.pipe(z.coerce.date());
	expect(createZodValues(datelikeToDate, z)).toBeInstanceOf(Date);
});

test('Zod coerce', () => {
	const datelike = z.union([z.number(), z.string(), z.date()]);
	const datelikeToDate = datelike.pipe(z.coerce.date());
	expect(createZodValues(datelikeToDate, z)).toBeInstanceOf(Date);
});

test('Zod strict', () => {
	const strict = z.strictObject({a: z.string()}).strict();
	expect(createZodValues(strict, z)).toEqual({a: ''});
});

test('Should create a color', () => {
	expect(createZodValues(zColor(), z)).toBe('#ffffff');
});
