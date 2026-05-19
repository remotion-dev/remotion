import {zColor, zMatrix, zTextarea} from '@remotion/zod-types';
import {z} from 'zod';

const schemaTestSchema = z.object({
	title: z.string().nullable(),
	delay: z.number().min(0).max(1000).step(0.1),
	color: zColor(),
	matrix: zMatrix(),
	list: z.array(z.object({name: z.string(), age: z.number()})),
	description: zTextarea().nullable(),
	country: z.enum(COUNTRY_NAMES),
	dropdown: z.enum(['a', 'b', 'c']),
	superSchema: z.array(
		z.discriminatedUnion('type', [
			z.object({
				type: z.literal('a'),
				a: z.object({a: z.string()}),
			}),
			z.object({
				type: z.literal('b'),
				b: z.object({b: z.string()}),
			}),
		]),
	),
	discriminatedUnion: z.discriminatedUnion('type', [
		z.object({
			type: z.literal('auto'),
		}),
		z.object({
			type: z.literal('fixed'),
			value: z.number().min(1080),
		}),
	]),
	tuple: z.tuple([z.string(), z.number(), z.object({a: z.string()})]),
});
