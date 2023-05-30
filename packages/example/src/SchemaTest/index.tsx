import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {z} from 'zod';

export const schemaTestSchema = z.object({
	title: z.string().nullable(),
	delay: z.number().min(0).max(1000).step(0.1),
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
}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 80,
			}}
		>
			<Sequence from={delay}>{title}</Sequence>
		</AbsoluteFill>
	);
};
