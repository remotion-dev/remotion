import {fitTextOnNLines, measureText} from '@remotion/layout-utils';
import {getBoundingBox} from '@remotion/paths';
import {createRoundedTextBox} from '@remotion/rounded-text-box';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {TIKTOK_TEXT_BOX_HORIZONTAL_PADDING} from '../TikTokTextbox/TikTokTextBox';

const boxWidth = 1500;
const fontFamily = 'Proxima Nova';
const fontWeight = 400;
const horizontalPadding = 30;
const cornerRadius = 20;
const lineHeight = 1.5;
const maxFontSize = 100;

export const fitTextOnNLinesSchema = z.object({
	text: z.string(),
	maxLines: z.number().step(1),
	textAlign: z.enum(['left', 'center', 'right']),
});

export const FitTextOnNLines: React.FC<
	z.infer<typeof fitTextOnNLinesSchema>
> = ({text: line, maxLines, textAlign}) => {
	const {fontSize, lines} = fitTextOnNLines({
		maxLines,
		maxBoxWidth: boxWidth - TIKTOK_TEXT_BOX_HORIZONTAL_PADDING * 2,
		fontFamily,
		text: line,
		fontWeight,
		maxFontSize,
	});

	const roundings = lines.map((line) =>
		measureText({
			text: line,
			fontFamily,
			fontSize,
			additionalStyles: {
				lineHeight,
			},
			fontVariantNumeric: 'normal',
			fontWeight,
			letterSpacing: 'normal',
			textTransform: 'none',
			validateFontIsLoaded: true,
		}),
	);
	const svg = createRoundedTextBox({
		textMeasurements: roundings,
		textAlign: textAlign,
		horizontalPadding,
		cornerRadius,
	});
	const boundingBox = getBoundingBox(svg);

	const lineStyle = React.useMemo<React.CSSProperties>(
		() => ({
			fontSize,
			fontWeight,
			fontFamily,
			lineHeight,
			textAlign,
			paddingLeft: horizontalPadding,
			paddingRight: horizontalPadding,
		}),
		[fontSize, textAlign],
	);

	return (
		<AbsoluteFill className="items-center justify-center bg-black">
			<div
				style={{
					width: boundingBox.width,
					height: boundingBox.height,
				}}
			>
				<svg
					viewBox={boundingBox.viewBox}
					style={{
						position: 'absolute',
						width: boundingBox.width,
						height: boundingBox.height,
						overflow: 'visible',
					}}
				>
					<path fill="white" d={svg} />
				</svg>
				<div style={{position: 'relative'}}>
					{lines.map((line, i) => (
						<div key={i} style={lineStyle}>
							{line}
						</div>
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};
