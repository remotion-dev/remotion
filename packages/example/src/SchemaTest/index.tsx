import {zColor, zMatrix, zTextarea} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {z} from 'zod';

const COUNTRY_NAMES = [
	'Afghanistan',
	'Albania',
	'Algeria',
	'Andorra',
	'Angola',
	'Argentina',
	'Armenia',
	'Australia',
	'Austria',
	'Azerbaijan',
	'Bahamas',
	'Bahrain',
	'Bangladesh',
	'Barbados',
	'Belarus',
	'Belgium',
	'Belize',
	'Benin',
	'Bhutan',
	'Bolivia',
	'Bosnia and Herzegovina',
	'Botswana',
	'Brazil',
	'Brunei',
	'Bulgaria',
	'Burkina Faso',
	'Burundi',
	'Cambodia',
	'Cameroon',
	'Canada',
	'Cape Verde',
	'Chad',
	'Chile',
	'China',
	'Colombia',
	'Costa Rica',
	'Croatia',
	'Cuba',
	'Cyprus',
	'Czech Republic',
	'Denmark',
	'Djibouti',
	'Dominican Republic',
	'Ecuador',
	'Egypt',
	'El Salvador',
	'Estonia',
	'Ethiopia',
	'Fiji',
	'Finland',
	'France',
	'Gabon',
	'Gambia',
	'Georgia',
	'Germany',
	'Ghana',
	'Greece',
	'Guatemala',
	'Guinea',
	'Haiti',
	'Honduras',
	'Hungary',
	'Iceland',
	'India',
	'Indonesia',
	'Iran',
	'Iraq',
	'Ireland',
	'Israel',
	'Italy',
	'Jamaica',
	'Japan',
	'Jordan',
	'Kazakhstan',
	'Kenya',
	'Kuwait',
	'Kyrgyzstan',
	'Laos',
	'Latvia',
	'Lebanon',
	'Lesotho',
	'Liberia',
	'Libya',
	'Liechtenstein',
	'Lithuania',
	'Luxembourg',
	'Madagascar',
	'Malawi',
	'Malaysia',
	'Maldives',
	'Mali',
	'Malta',
	'Mauritania',
	'Mauritius',
	'Mexico',
	'Moldova',
	'Monaco',
	'Mongolia',
	'Montenegro',
	'Morocco',
] as const;

export const schemaTestSchema = z.object({
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

export const SchemaTest: React.FC<z.infer<typeof schemaTestSchema>> = ({
	delay,
	title,
	color,
	list,
	description,
	country,
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

				<p style={{fontSize: 36, color: '#888', marginTop: 24}}>{country}</p>
			</Sequence>
		</AbsoluteFill>
	);
};
