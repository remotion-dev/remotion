import {zColor} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {z} from 'zod';

export const schemaTestSchema = z.object({
	title: z.string().nullable(),
	delay: z.number().min(0).max(1000).step(0.1),
	color: zColor(),
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
				<span style={{color}}>{title}</span>
			</Sequence>
		</AbsoluteFill>
	);
};
