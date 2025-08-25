import {fitTextOnNLines} from '@remotion/layout-utils';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {
	TIKTOK_TEXT_BOX_HORIZONTAL_PADDING,
	TikTokTextBox,
} from '../TikTokTextbox/TikTokTextBox';

const boxWidth = 1200;
const fontFamily = 'Proxima Nova';
const fontWeight = 'bold';

export const fitTextOnNLinesSchema = z.object({
	line: z.string(),
	maxLines: z.number(),
});

export const FitTextOnNLines: React.FC<
	z.infer<typeof fitTextOnNLinesSchema>
> = ({line, maxLines}) => {
	const {fontSize: bestFontSize, lines} = fitTextOnNLines({
		maxLines,
		maxBoxWidth: boxWidth - TIKTOK_TEXT_BOX_HORIZONTAL_PADDING * 2,
		fontFamily,
		text: line,
		fontWeight,
		maxFontSize: 100,
	});
	const fontSize = bestFontSize;

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#1F2429',
			}}
		>
			<div
				style={{
					width: boxWidth,
					fontSize,
					overflow: 'auto',
					fontWeight,
					fontFamily,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					color: 'black',
				}}
			>
				<TikTokTextBox
					bgColor="white"
					textColor="black"
					lines={lines}
					fontFamily={fontFamily}
					textAlign="center"
				></TikTokTextBox>
			</div>
		</AbsoluteFill>
	);
};
