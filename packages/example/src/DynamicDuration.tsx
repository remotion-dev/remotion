import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';

export const dynamicDurationSchema = z.object({
	duration: z.number().min(1).max(1000).default(100),
});

export const DynamicDuration: React.FC<
	z.infer<typeof dynamicDurationSchema>
> = () => {
	return (
		<AbsoluteFill>
			<svg>
				<path transformOrigin="center" style={{scale: 2}}>
					hi
				</path>
			</svg>
		</AbsoluteFill>
	);
};
