import {zColor} from '@remotion/z-color';
import {expect, test} from 'vitest';
import {getZodIfPossible} from '../editor/components/get-zod-if-possible';
import {createZodValues} from '../editor/components/RenderModal/SchemaEditor/create-zod-values';

const getZ = async () => {
	const z = await getZodIfPossible();
	if (!z) {
		throw new Error('Zod not found');
	}

	return z;
};

test('Should be able to create a string', async () => {
	const z = await getZ();

	const hi = createZodValues(z.string(), z);
	expect(hi).toBe('');
});

test('Should be able to create a number', async () => {
	const z = await getZ();

	const hi = createZodValues(z.number(), z);
	expect(hi).toBe(0);
});

test('Should be able to create an object', async () => {
	const z = await getZ();

	const hi = createZodValues(
		z.object({
			a: z.string(),
			b: z.number(),
		}),
		z
	);
	expect(hi).toEqual({a: '', b: 0});
});

test('Should be able to create an array', async () => {
	const z = await getZ();

	expect(createZodValues(z.array(z.string()), z)).toEqual(['']);
	expect(createZodValues(z.array(z.number()), z)).toEqual([0]);
});

test('Should be able to create a union', async () => {
	const z = await getZ();

	expect(createZodValues(z.union([z.string(), z.number()]), z)).toBe('');
	expect(createZodValues(z.union([z.number(), z.string()]), z)).toBe(0);
	// @ts-expect-error union
	expect(createZodValues(z.union([]))).toBe(undefined);
});

test('Zod literal', async () => {
	const z = await getZ();

	expect(createZodValues(z.literal('hi'), z)).toBe('hi');
});

test('Should be able to create a discriminated union', async () => {
	const z = await getZ();

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

test('Zod instanceof', async () => {
	const z = await getZ();

	expect(() => createZodValues(z.instanceof(Error), z)).toThrow(
		/Cannot create a value for type z.any()/
	);
});

test('Zod intersection', async () => {
	const z = await getZ();

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

test('Zod tuples', async () => {
	const z = await getZ();

	const Tuple = z.tuple([z.string(), z.number()]);
	expect(createZodValues(Tuple, z)).toEqual(['', 0]);
});

test('Zod record', async () => {
	const z = await getZ();

	const Record = z.record(z.string());
	expect(createZodValues(Record, z)).toEqual({key: ''});
});

test('Zod map', async () => {
	const z = await getZ();

	const map = z.map(z.string(), z.number());
	expect(createZodValues(map, z)).toEqual(new Map([['', 0]]));
});

test('Zod lazy', async () => {
	const z = await getZ();

	const Lazy = z.lazy(() => z.string());
	expect(createZodValues(Lazy, z)).toBe('');
});

test('Zod set', async () => {
	const z = await getZ();

	const set = z.set(z.string());
	expect(createZodValues(set, z)).toEqual(new Set(['']));
	const set2 = z.set(z.number());
	expect(createZodValues(set2, z)).toEqual(new Set([0]));
});

test('Zod function', async () => {
	const z = await getZ();

	const fn = z.function();
	expect(() => createZodValues(fn, z)).toThrow(
		/Cannot create a value for type function/
	);
});

test('Zod undefined', async () => {
	const z = await getZ();

	const undef = z.void();
	expect(createZodValues(undef, z)).toBe(undefined);
});

test('Zod null', async () => {
	const z = await getZ();

	const undef = z.null();
	expect(createZodValues(undef, z)).toBe(null);
});

test('Zod enum', async () => {
	const z = await getZ();

	const Enum = z.enum(['a', 'b']);
	expect(createZodValues(Enum, z)).toBe('a');
});

test('Zod nativeEnum', async () => {
	const z = await getZ();

	enum Fruits {
		Apple,
		Banana,
	}
	const Enum = z.nativeEnum(Fruits);
	expect(createZodValues(Enum, z)).toBe(Fruits.Apple);
});

test('Zod optional', async () => {
	const z = await getZ();

	const Optional = z.string().optional();
	expect(createZodValues(Optional, z)).toBe('');
});

test('Zod nullable', async () => {
	const z = await getZ();

	const Nullable = z.string().nullable();
	expect(createZodValues(Nullable, z)).toBe('');
});

test('Zod undefined', async () => {
	const z = await getZ();

	const undef = z.string().default('tuna');
	expect(createZodValues(undef, z)).toBe('tuna');
});

test('Zod catch', async () => {
	const z = await getZ();

	const undef = z.string().catch('tuna');
	expect(createZodValues(undef, z)).toBe('');
});

test('Zod promise', async () => {
	const z = await getZ();

	const undef = z.string().promise();
	(createZodValues(undef, z) as Promise<unknown>).then((v) => {
		expect(v).toBe('');
	});
});

test('Zod transform', async () => {
	const z = await getZ();

	// Intentional: We don't parse the Zod values, so we should not transform them
	const undef = z.literal('abc').transform((v) => v.toUpperCase());
	expect(createZodValues(undef, z)).toBe('abc');
});

test('Zod branded', async () => {
	const z = await getZ();

	const Cat = z.object({name: z.string()}).brand<'Cat'>();
	expect(createZodValues(Cat, z)).toEqual({name: ''});
});

test('Zod lazy', async () => {
	const z = await getZ();

	const datelike = z.union([z.number(), z.string(), z.date()]);
	const datelikeToDate = datelike.pipe(z.coerce.date());
	expect(createZodValues(datelikeToDate, z)).toBeInstanceOf(Date);
});

test('Zod coerce', async () => {
	const z = await getZ();

	const datelike = z.union([z.number(), z.string(), z.date()]);
	const datelikeToDate = datelike.pipe(z.coerce.date());
	expect(createZodValues(datelikeToDate, z)).toBeInstanceOf(Date);
});

test('Zod strict', async () => {
	const z = await getZ();

	const strict = z.strictObject({a: z.string()}).strict();
	expect(createZodValues(strict, z)).toEqual({a: ''});
});

test('Should create a color', async () => {
	const z = await getZ();

	expect(createZodValues(zColor(), z)).toBe('#ffffff');
});
