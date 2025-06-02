import {fitTextOnNLines} from '@remotion/layout-utils';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';

const boxWidth = 600;
const fontFamily = 'GT Planar';
const fontWeight = 'bold';

export const fitTextOnNLinesSchema = z.object({
	line: z.string(),
	maxLines: z.number(),
});

export const FitTextOnNLines: React.FC<
	z.infer<typeof fitTextOnNLinesSchema>
> = ({line, maxLines}) => {
	const fontSize = Math.min(
		80,
		fitTextOnNLines({
			maxLines,
			maxBoxWidth: boxWidth,
			fontFamily,
			text: line,
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
						fontSize,
						overflow: 'auto',
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
