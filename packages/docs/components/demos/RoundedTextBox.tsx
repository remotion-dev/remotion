import {fitTextOnNLines, measureText} from '@remotion/layout-utils';
import type {TextAlign} from '@remotion/rounded-text-box';
import {createRoundedTextBox} from '@remotion/rounded-text-box';
import React from 'react';
import {AbsoluteFill} from 'remotion';

type Props = {
	readonly textAlign: TextAlign;
	readonly maxLines: number;
	readonly borderRadius: number;
	readonly horizontalPadding: number;
};

const TIKTOK_TEXT_BOX_HORIZONTAL_PADDING = 20;
const text =
	'No matter how much text I am adding, the text always fits on 3 lines and there is corner rounding like on TikTok.';

const boxWidth = 1500;
const fontFamily = 'Proxima Nova';
const fontWeight = 400;
const lineHeight = 1.5;
const maxFontSize = 200;

export const RoundedTextBox: React.FC<Props> = ({
	textAlign,
	maxLines,
	borderRadius,
	horizontalPadding,
}) => {
	const {fontSize, lines} = fitTextOnNLines({
		maxLines,
		maxBoxWidth: boxWidth - TIKTOK_TEXT_BOX_HORIZONTAL_PADDING * 2,
		fontFamily,
		text,
		fontWeight,
		maxFontSize,
	});

	const textMeasurements = lines.map((t) =>
		measureText({
			text: t,
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
	const {d, boundingBox} = createRoundedTextBox({
		textMeasurements,
		textAlign,
		horizontalPadding,
		borderRadius,
	});

	const lineStyle = React.useMemo<React.CSSProperties>(
		() => ({
			fontSize,
			fontWeight,
			fontFamily,
			lineHeight,
			textAlign,
			paddingLeft: horizontalPadding,
			paddingRight: horizontalPadding,
			color: 'white',
		}),
		[fontSize, textAlign, horizontalPadding],
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'var(--background)',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
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
					<path fill="black" d={d} />
				</svg>
				<div style={{position: 'relative'}}>
					{lines.map((line, i) => (
						// eslint-disable-next-line react/no-array-index-key
						<div key={i} style={lineStyle}>
							{line}
						</div>
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};
