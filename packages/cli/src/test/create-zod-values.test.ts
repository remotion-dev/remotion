import {z, zColor} from 'remotion';
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

test('Zod literal', () => {
	expect(createZodValues(z.literal('hi'))).toBe('hi');
});

test('Should be able to create a discriminated union', () => {
	expect(
		createZodValues(
			z.discriminatedUnion('status', [
				z.object({status: z.literal('success'), data: z.string()}),
				z.object({status: z.literal('failed'), error: z.instanceof(Error)}),
			])
		)
	).toEqual({status: 'success', data: ''});

	expect(
		createZodValues(
			z.discriminatedUnion('status', [
				z.object({status: z.literal('failed'), error: z.number()}),
				z.object({status: z.literal('success'), data: z.string()}),
			])
		)
	).toEqual({status: 'failed', error: 0});

	// @ts-expect-error invalid zod type
	expect(() => createZodValues(z.discriminatedUnion('status', []))).toThrow(
		/Invalid zod schema/
	);
});

test('Zod instanceof', () => {
	expect(() => createZodValues(z.instanceof(Error))).toThrow(
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
	expect(createZodValues(EmployedPerson)).toEqual({
		name: '',
		role: '',
	});
});

test('Zod tuples', () => {
	const Tuple = z.tuple([z.string(), z.number()]);
	expect(createZodValues(Tuple)).toEqual(['', 0]);
});

test('Zod record', () => {
	const Record = z.record(z.string());
	expect(createZodValues(Record)).toEqual({key: ''});
});

test('Zod map', () => {
	const map = z.map(z.string(), z.number());
	expect(createZodValues(map)).toEqual(new Map([['', 0]]));
});

test('Zod lazy', () => {
	const Lazy = z.lazy(() => z.string());
	expect(createZodValues(Lazy)).toBe('');
});

test('Zod set', () => {
	const set = z.set(z.string());
	expect(createZodValues(set)).toEqual(new Set(['']));
	const set2 = z.set(z.number());
	expect(createZodValues(set2)).toEqual(new Set([0]));
});

test('Zod function', () => {
	const fn = z.function();
	expect(() => createZodValues(fn)).toThrow(
		/Cannot create a value for type function/
	);
});

test('Zod undefined', () => {
	const undef = z.void();
	expect(createZodValues(undef)).toBe(undefined);
});

test('Zod null', () => {
	const undef = z.null();
	expect(createZodValues(undef)).toBe(null);
});

test('Zod enum', () => {
	const Enum = z.enum(['a', 'b']);
	expect(createZodValues(Enum)).toBe('a');
});

test('Zod nativeEnum', () => {
	enum Fruits {
		Apple,
		Banana,
	}
	const Enum = z.nativeEnum(Fruits);
	expect(createZodValues(Enum)).toBe(Fruits.Apple);
});

test('Zod optional', () => {
	const Optional = z.string().optional();
	expect(createZodValues(Optional)).toBe('');
});

test('Zod nullable', () => {
	const Nullable = z.string().nullable();
	expect(createZodValues(Nullable)).toBe('');
});

test('Zod undefined', () => {
	const undef = z.string().default('tuna');
	expect(createZodValues(undef)).toBe('tuna');
});

test('Zod catch', () => {
	const undef = z.string().catch('tuna');
	expect(createZodValues(undef)).toBe('');
});

test('Zod promise', () => {
	const undef = z.string().promise();
	(createZodValues(undef) as Promise<unknown>).then((v) => {
		expect(v).toBe('');
	});
});

test('Zod transform', () => {
	// Intentional: We don't parse the Zod values, so we should not transform them
	const undef = z.literal('abc').transform((v) => v.toUpperCase());
	expect(createZodValues(undef)).toBe('abc');
});

test('Zod branded', () => {
	const Cat = z.object({name: z.string()}).brand<'Cat'>();
	expect(createZodValues(Cat)).toEqual({name: ''});
});

test('Zod lazy', () => {
	const datelike = z.union([z.number(), z.string(), z.date()]);
	const datelikeToDate = datelike.pipe(z.coerce.date());
	expect(createZodValues(datelikeToDate)).toBeInstanceOf(Date);
});

test('Zod coerce', () => {
	const datelike = z.union([z.number(), z.string(), z.date()]);
	const datelikeToDate = datelike.pipe(z.coerce.date());
	expect(createZodValues(datelikeToDate)).toBeInstanceOf(Date);
});

test('Zod strict', () => {
	const strict = z.strictObject({a: z.string()}).strict();
	expect(createZodValues(strict)).toEqual({a: ''});
});

test('Should create a color', () => {
	expect(createZodValues(zColor())).toBe('#ffffff');
});
