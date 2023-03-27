import React from 'react';
import {AbsoluteFill, Sequence, z} from 'remotion';

export const schemaTestSchema = z.object({
	title: z.string(),
	delay: z.number().min(0).max(1000).step(1),
});

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
