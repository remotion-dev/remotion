/**
 * Based on https://discord.com/channels/809501355504959528/833092843290624050/1375320798969200660
 * and improved: https://discord.com/channels/809501355504959528/833092843290624050/1379446302903107624
 */

import {getBoundingBox} from '@remotion/paths';
import {getCornerRoundings} from './get-corner-roundings';
import {makeSvg} from './svg';

interface TikTokTextBoxProps {
	lines: string[];
	textAlign: 'left' | 'center' | 'right';
	fontFamily: string;
	textColor?: string;
	className?: string;
	borderRadius?: number;
	fontSize: number;
}

export const TIKTOK_TEXT_BOX_HORIZONTAL_PADDING = 20;

const TikTokTextLine: React.FC<{
	text: string;
	align?: React.CSSProperties['textAlign'];
	className?: string;
	style?: React.CSSProperties;
}> = ({text, align, className, style}) => {
	return (
		<div style={{position: 'relative'}}>
			<div
				style={
					{
						textAlign: align,
						padding: `0px ${TIKTOK_TEXT_BOX_HORIZONTAL_PADDING}px`,
						...style,
					} as React.CSSProperties
				}
				className={className}
			>
				{text}
			</div>
		</div>
	);
};

export const TikTokTextBox: React.FC<TikTokTextBoxProps> = ({
	lines,
	textAlign: align,
	fontFamily = 'Arial',
	textColor,
	fontSize,
}) => {
	const fontWeight = 400;
	const roundings = getCornerRoundings({
		lines,
		fontFamily,
		fontSize,
		additionalStyles: {},
		fontVariantNumeric: 'normal',
		fontWeight,
		letterSpacing: 'normal',
		textTransform: 'none',
		align,
	});
	const svg = makeSvg({
		cornerRoundings: roundings,
		textAlign: align,
		horizontalPadding: TIKTOK_TEXT_BOX_HORIZONTAL_PADDING,
	});
	const boundingBox = getBoundingBox(svg);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems:
					align === 'left'
						? 'flex-start'
						: align === 'right'
							? 'flex-end'
							: 'center',
				textAlign: align,
				fontFamily,
				color: textColor ?? 'black',
				lineHeight: 1.5,
				fontWeight,
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
				<path fill="white" d={svg} strokeWidth={3} />
			</svg>

			{lines.map((line, i) => (
				<TikTokTextLine key={i} text={line} align={align} style={{}} />
			))}
		</div>
	);
};

export const TikTokTextBoxPlayground = () => {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				padding: '0.4em',
				backgroundColor: '#d2d9d4',
				fontSize: '4em',
				gap: '0.2em',
			}}
		>
			<TikTokTextBox
				lines={['Align Left', 'with two lines', 'Third Line']}
				textAlign="left"
				fontFamily="Arial"
				fontSize={16}
			/>
			<TikTokTextBox
				lines={['Align Center', 'short', 'Third Line']}
				textAlign="center"
				fontFamily="Proxima Nova Semibold"
				fontSize={16}
			/>
			<TikTokTextBox
				lines={['Align Right', 'with two lines', 'Third Line']}
				textAlign="right"
				fontFamily="Proxima Nova Semibold"
				textColor="black"
				fontSize={16}
			/>
			<TikTokTextBox
				lines={['short1', 'short']}
				textAlign="center"
				fontFamily="Proxima Nova Semibold"
				fontSize={16}
			/>
		</div>
	);
};
