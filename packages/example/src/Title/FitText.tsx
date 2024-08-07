import {fitText} from '@remotion/layout-utils';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';

const boxWidth = 600;
// Must be loaded before calling fitText()
const fontFamily = 'GT Planar';
const fontWeight = 'bold';

export const fitTextSchema = z.object({
	line: z.string(),
});

export const FitText: React.FC<z.infer<typeof fitTextSchema>> = ({line}) => {
	const fontSize = Math.min(
		80,
		fitText({
			fontFamily,
			text: line,
			withinWidth: boxWidth,
			fontWeight,
			textTransform: 'uppercase',
		}).fontSize,
	);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<div style={{backgroundColor: '#0B84F3', padding: 20}}>
				<div
					style={{
						width: boxWidth,
						outline: '1px dashed rgba(255, 255, 255, 0.5)',
						height: 100,
						fontSize,
						fontWeight,
						fontFamily,
						display: 'flex',
						alignItems: 'center',
						color: 'white',
						textTransform: 'uppercase',
					}}
				>
					{line}
				</div>
			</div>
		</AbsoluteFill>
	);
};
