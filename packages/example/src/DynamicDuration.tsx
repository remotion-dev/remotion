import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {dynamicDurationSchema} from './DynamicDuration-schema';

export const DynamicDuration: React.FC<
	z.infer<typeof dynamicDurationSchema>
> = () => {
	return (
		<AbsoluteFill>
			<svg>
				<path style={{scale: 2}}>hi</path>
			</svg>
		</AbsoluteFill>
	);
};
