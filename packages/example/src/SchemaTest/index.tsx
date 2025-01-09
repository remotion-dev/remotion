import {zColor, zTextarea} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {z} from 'zod';

export const schemaTestSchema = z.object({
	title: z.string().nullable(),
	delay: z.number().min(0).max(1000).step(0.1),
	color: zColor(),
	list: z.array(z.object({name: z.string(), age: z.number()})),
	description: zTextarea().nullable(),
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

export const schemaArrayTestSchema = z.array(z.number());

export const ArrayTest: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 80,
			}}
		/>
	);
};

export const SchemaTest: React.FC<z.infer<typeof schemaTestSchema>> = ({
	delay,
	title,
	color,
	list,
	description,
}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 80,
			}}
		>
			<Sequence from={delay}>
				<span style={{marginRight: 20, color}}>{title}</span>

				<ul style={{listStyleType: 'disc'}}>
					{list.map((item) => (
						<li key={item.name} style={{fontSize: 30, color: 'red'}}>
							{item.name} is {item.age} years old
						</li>
					))}
				</ul>

				<p style={{whiteSpace: 'pre-line', color}}>{description}</p>
			</Sequence>
		</AbsoluteFill>
	);
};
