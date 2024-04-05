import {expect, test} from 'bun:test';
import {createZodValues} from '../components/RenderModal/SchemaEditor/create-zod-values';
import {
	getZTypesIfPossible,
	getZodIfPossible,
} from '../components/get-zod-if-possible';

const getZ = async () => {
	const z = await getZodIfPossible();
	if (!z) {
		throw new Error('Zod not found');
	}

	return z;
};

const getZodTypes = async () => {
	const z = await getZTypesIfPossible();
	if (!z) {
		throw new Error('@remotion/zod-types not found');
	}

	return z;
};

test('Should be able to create a string', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const hi = createZodValues(z.string(), z, zodTypes);
	expect(hi).toBe('');
});

test('Should be able to create a number', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const hi = createZodValues(z.number(), z, zodTypes);
	expect(hi).toBe(0);
});

test('Should be able to create an object', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const hi = createZodValues(
		z.object({
			a: z.string(),
			b: z.number(),
		}),
		z,
		zodTypes,
	);
	expect(hi).toEqual({a: '', b: 0});
});

test('Should be able to create an array', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	expect(createZodValues(z.array(z.string()), z, zodTypes)).toEqual(['']);
	expect(createZodValues(z.array(z.number()), z, zodTypes)).toEqual([0]);
});

test('Should be able to create a union', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	expect(createZodValues(z.union([z.string(), z.number()]), z, zodTypes)).toBe(
		'',
	);
	expect(createZodValues(z.union([z.number(), z.string()]), z, zodTypes)).toBe(
		0,
	);
	// @ts-expect-error union
	expect(createZodValues(z.union([]), z, zodTypes)).toBe(undefined);
});

test('Zod literal', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	expect(createZodValues(z.literal('hi'), z, zodTypes)).toBe('hi');
});

test('Should be able to create a discriminated union', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	expect(
		createZodValues(
			z.discriminatedUnion('status', [
				z.object({status: z.literal('success'), data: z.string()}),
				z.object({status: z.literal('failed'), error: z.instanceof(Error)}),
			]),
			z,
			zodTypes,
		),
	).toEqual({status: 'success', data: ''});

	expect(
		createZodValues(
			z.discriminatedUnion('status', [
				z.object({status: z.literal('failed'), error: z.number()}),
				z.object({status: z.literal('success'), data: z.string()}),
			]),
			z,
			zodTypes,
		),
	).toEqual({status: 'failed', error: 0});

	expect(() =>
		// @ts-expect-error invalid zod type
		createZodValues(z.discriminatedUnion('status', []), z, zodTypes),
	).toThrow(/Invalid zod schema/);
});

test('Zod instanceof', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	expect(() => createZodValues(z.instanceof(Error), z, zodTypes)).toThrow(
		/Cannot create a value for type z.any()/,
	);
});

test('Zod intersection', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const Person = z.object({
		name: z.string(),
	});

	const Employee = z.object({
		role: z.string(),
	});

	const EmployedPerson = z.intersection(Person, Employee);
	expect(createZodValues(EmployedPerson, z, zodTypes)).toEqual({
		name: '',
		role: '',
	});
});

test('Zod tuples', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const Tuple = z.tuple([z.string(), z.number()]);
	expect(createZodValues(Tuple, z, zodTypes)).toEqual(['', 0]);
});

test('Zod record', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const Record = z.record(z.string());
	expect(createZodValues(Record, z, zodTypes)).toEqual({key: ''});
});

test('Zod map', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const map = z.map(z.string(), z.number());
	expect(createZodValues(map, z, zodTypes)).toEqual(new Map([['', 0]]));
});

test('Zod lazy', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const Lazy = z.lazy(() => z.string());
	expect(createZodValues(Lazy, z, zodTypes)).toBe('');
});

test('Zod set', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const set = z.set(z.string());
	expect(createZodValues(set, z, zodTypes)).toEqual(new Set(['']));
	const set2 = z.set(z.number());
	expect(createZodValues(set2, z, zodTypes)).toEqual(new Set([0]));
});

test('Zod function', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const fn = z.function();
	expect(() => createZodValues(fn, z, zodTypes)).toThrow(
		/Cannot create a value for type function/,
	);
});

test('Zod undefined', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const undef = z.void();
	expect(createZodValues(undef, z, zodTypes)).toBe(undefined);
});

test('Zod null', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const undef = z.null();
	expect(createZodValues(undef, z, zodTypes)).toBe(null);
});

test('Zod enum', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const Enum = z.enum(['a', 'b']);
	expect(createZodValues(Enum, z, zodTypes)).toBe('a');
});

test('Zod nativeEnum', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	enum Fruits {
		Apple,
		Banana,
	}
	const Enum = z.nativeEnum(Fruits);
	expect(createZodValues(Enum, z, zodTypes)).toBe(Fruits.Apple);
});

test('Zod optional', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const Optional = z.string().optional();
	expect(createZodValues(Optional, z, zodTypes)).toBe('');
});

test('Zod nullable', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const Nullable = z.string().nullable();
	expect(createZodValues(Nullable, z, zodTypes)).toBe('');
});

test('Zod undefined', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const undef = z.string().default('tuna');
	expect(createZodValues(undef, z, zodTypes)).toBe('tuna');
});

test('Zod catch', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const undef = z.string().catch('tuna');
	expect(createZodValues(undef, z, zodTypes)).toBe('');
});

test('Zod promise', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const undef = z.string().promise();
	(createZodValues(undef, z, zodTypes) as Promise<unknown>).then((v) => {
		expect(v).toBe('');
	});
});

test('Zod transform', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	// Intentional: We don't parse the Zod values, so we should not transform them
	const undef = z.literal('abc').transform((v) => v.toUpperCase());
	expect(createZodValues(undef, z, zodTypes)).toBe('abc');
});

test('Zod branded', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const Cat = z.object({name: z.string()}).brand<'Cat'>();
	expect(createZodValues(Cat, z, zodTypes)).toEqual({name: ''});
});

test('Zod lazy', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const datelike = z.union([z.number(), z.string(), z.date()]);
	const datelikeToDate = datelike.pipe(z.coerce.date());
	expect(createZodValues(datelikeToDate, z, zodTypes)).toBeInstanceOf(Date);
});

test('Zod coerce', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const datelike = z.union([z.number(), z.string(), z.date()]);
	const datelikeToDate = datelike.pipe(z.coerce.date());
	expect(createZodValues(datelikeToDate, z, zodTypes)).toBeInstanceOf(Date);
});

test('Zod strict', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	const strict = z.strictObject({a: z.string()}).strict();
	expect(createZodValues(strict, z, zodTypes)).toEqual({a: ''});
});

test('Should create a color', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	expect(createZodValues(zodTypes.zColor(), z, zodTypes)).toBe('#ffffff');
});

test('Should create a textarea', async () => {
	const z = await getZ();
	const zodTypes = await getZodTypes();

	expect(createZodValues(zodTypes.zTextarea(), z, zodTypes)).toBe('');
});
