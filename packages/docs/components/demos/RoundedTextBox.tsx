import {loadFont} from '@remotion/google-fonts/Figtree';
import {fitTextOnNLines, measureText} from '@remotion/layout-utils';
import type {TextAlign} from '@remotion/rounded-text-box';
import {createRoundedTextBox} from '@remotion/rounded-text-box';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill} from 'remotion';

type Props = {
	readonly textAlign: TextAlign;
	readonly maxLines: number;
	readonly borderRadius: number;
	readonly horizontalPadding: number;
	readonly text: string;
};

const fontWeight = '700';
const boxWidth = 1100;
const lineHeight = 1.5;
const maxFontSize = 70;

const {waitUntilDone, fontFamily} = loadFont('normal', {
	weights: [fontWeight],
	subsets: ['latin'],
});

const RoundedTextBoxInner: React.FC<Props> = ({
	textAlign,
	maxLines,
	borderRadius,
	horizontalPadding,
	text,
}) => {
	const {fontSize, lines} = fitTextOnNLines({
		maxLines,
		maxBoxWidth: boxWidth - horizontalPadding * 2,
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
			color: 'black',
		}),
		[fontSize, textAlign, horizontalPadding],
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#eee',
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
					<path fill="white" d={d} />
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

export const RoundedTextBox: React.FC<Props> = (props) => {
	const [fontsLoaded, setFontsLoaded] = useState(false);

	useEffect(() => {
		waitUntilDone()
			.then(() => {
				setFontsLoaded(true);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null;
	}

	return <RoundedTextBoxInner {...props} />;
};
