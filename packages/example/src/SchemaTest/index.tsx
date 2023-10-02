import {zColor} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {z} from 'zod';

export const schemaTestSchema = z.object({
	title: z.string().nullable(),
	delay: z.number().min(0).max(1000).step(0.1),
	color: zColor(),
	list: z.array(z.string()),
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
						<li key={item} style={{fontSize: 10}}>
							{item}
						</li>
					))}
				</ul>
			</Sequence>
		</AbsoluteFill>
	);
};
