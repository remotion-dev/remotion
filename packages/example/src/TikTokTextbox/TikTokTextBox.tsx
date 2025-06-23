/**
 * Based on https://discord.com/channels/809501355504959528/833092843290624050/1375320798969200660
 * and improved: https://discord.com/channels/809501355504959528/833092843290624050/1379446302903107624
 */

import {measureText, TextTransform} from '@remotion/layout-utils';
import {getActualBorderRadius, getPathForCorner} from './rounded-corner';

interface TikTokTextBoxProps {
	lines: string[];
	textAlign: React.CSSProperties['textAlign'];
	fontFamily: string;
	bgColor?: string;
	textColor?: string;
	className?: string;
	borderRadius?: number;
}

interface CornerRounding {
	topLeft: boolean;
	topRight: boolean;
	bottomLeft: boolean;
	bottomRight: boolean;
	cornerTopLeft: boolean;
	cornerTopRight: boolean;
	cornerBottomLeft: boolean;
	cornerBottomRight: boolean;
	cornerLeft: boolean;
	cornerRight: boolean;
	widthDifferenceToPrevious: number | undefined;
	widthDifferenceToNext: number | undefined;
	align: React.CSSProperties['textAlign'];
}

const getCornerRoundings = ({
	lines,
	fontFamily,
	fontSize,
	additionalStyles,
	fontVariantNumeric,
	fontWeight,
	letterSpacing,
	textTransform,
	align,
}: {
	lines: string[];
	fontFamily: string;
	fontSize: number;
	additionalStyles: React.CSSProperties;
	fontVariantNumeric: string;
	fontWeight: number;
	letterSpacing: string;
	textTransform: TextTransform;
	align: React.CSSProperties['textAlign'];
}): CornerRounding[] => {
	const lengths = lines.map((line) =>
		measureText({
			text: line,
			fontFamily,
			fontSize,
			additionalStyles,
			fontVariantNumeric,
			fontWeight,
			letterSpacing,
			textTransform,
			validateFontIsLoaded: true,
		}),
	);
	const n = lengths.length;

	return lines.map((_, i) => {
		const isFirst = i === 0;
		const isLast = i === n - 1;
		const prevLen = i > 0 ? lengths[i - 1] : undefined;
		const nextLen = i < n - 1 ? lengths[i + 1] : undefined;
		const currLen = lengths[i];

		const widthDifferenceToPrevious =
			prevLen !== undefined ? currLen.width - prevLen.width : undefined;
		const widthDifferenceToNext =
			nextLen !== undefined ? currLen.width - nextLen.width : undefined;

		// Determine rounded corners
		let topLeft =
			isFirst ||
			(prevLen !== undefined &&
				currLen.width - 0 > prevLen.width &&
				align !== 'left');
		let topRight =
			isFirst ||
			(prevLen !== undefined &&
				currLen.width - 0 > prevLen.width &&
				align !== 'right');
		let bottomLeft =
			isLast ||
			(nextLen !== undefined &&
				currLen.width - 0 > nextLen.width &&
				align !== 'left');
		let bottomRight =
			isLast ||
			(nextLen !== undefined &&
				currLen.width - 0 > nextLen.width &&
				align !== 'right');

		if (!isFirst && !isLast) {
			if (align === 'left') {
				topLeft = bottomLeft = false;
			} else if (align === 'right') {
				topRight = bottomRight = false;
			}
		}

		// Determine corner properties
		let cornerTopLeft = false;
		let cornerTopRight = false;
		let cornerBottomLeft = false;
		let cornerBottomRight = false;
		const cornerLeft = false;
		const cornerRight = false;

		if (align === 'left') {
			cornerBottomRight = !bottomRight;
			cornerTopRight = !topRight;
		} else if (align === 'right') {
			cornerBottomLeft = !bottomLeft;
			cornerTopLeft = !topLeft;
		} else if (align === 'center') {
			// LEFT side

			cornerTopLeft = !topLeft;
			cornerBottomLeft = !bottomLeft;
			// RIGHT side

			cornerTopRight = !topRight;
			cornerBottomRight = !bottomRight;
		}

		const roundings: CornerRounding = {
			topLeft,
			topRight,
			bottomLeft,
			bottomRight,
			cornerTopLeft,
			cornerTopRight,
			cornerBottomLeft,
			cornerBottomRight,
			cornerLeft,
			cornerRight,

			align,
			widthDifferenceToPrevious,
			widthDifferenceToNext,
		};
		return roundings;
	});
};

const getBorderRadius = (rounding: CornerRounding, radius: number) => {
	return [
		rounding.topLeft
			? `${getActualBorderRadius({desiredBorderRadius: radius, widthDifference: rounding.widthDifferenceToPrevious})}px`
			: '0',
		rounding.topRight
			? `${getActualBorderRadius({desiredBorderRadius: radius, widthDifference: rounding.widthDifferenceToPrevious})}px`
			: '0',
		rounding.bottomRight
			? `${getActualBorderRadius({desiredBorderRadius: radius, widthDifference: rounding.widthDifferenceToNext})}px`
			: '0',
		rounding.bottomLeft
			? `${getActualBorderRadius({desiredBorderRadius: radius, widthDifference: rounding.widthDifferenceToNext})}px`
			: '0',
	].join(' ');
};

export const TIKTOK_TEXT_BOX_HORIZONTAL_PADDING = 20;

const TopLeftCorner: React.FC<{
	bgColor: string;
	borderRadiusValue: number;
	widthDifference: number | undefined;
}> = ({bgColor, borderRadiusValue, widthDifference}) => {
	const {d, borderRadius, width} = getPathForCorner({
		corner: 'top-right',
		desiredBorderRadius: borderRadiusValue,
		widthDifference,
	});
	return (
		<div
			style={{
				position: 'absolute',
				left: -width,
				top: 0,
				width: width,
			}}
		>
			<svg
				style={{
					width,
					height: width,
					overflow: 'visible',
				}}
				viewBox={`0 0 ${borderRadius} ${borderRadius}`}
			>
				<path fill={bgColor} d={d} />
			</svg>
		</div>
	);
};

const TopRightCorner: React.FC<{
	bgColor: string;
	borderRadiusValue: number;
	widthDifference: number | undefined;
}> = ({bgColor, borderRadiusValue, widthDifference}) => {
	const {d, borderRadius, width} = getPathForCorner({
		corner: 'top-left',
		desiredBorderRadius: borderRadiusValue,
		widthDifference,
	});
	return (
		<div
			style={{
				position: 'absolute',
				right: -width,
				top: 0,
				width: width,
			}}
		>
			<svg
				style={{
					width,
					height: width,
					overflow: 'visible',
				}}
				viewBox={`0 0 ${borderRadius} ${borderRadius}`}
			>
				<path fill={bgColor} d={d} />
			</svg>
		</div>
	);
};

const BottomLeftCorner: React.FC<{
	bgColor: string;
	borderRadiusValue: number;
	widthDifference: number | undefined;
}> = ({bgColor, borderRadiusValue, widthDifference}) => {
	const {d, borderRadius, width} = getPathForCorner({
		corner: 'bottom-right',
		desiredBorderRadius: borderRadiusValue,
		widthDifference,
	});
	return (
		<div
			style={{
				position: 'absolute',
				left: -width,
				bottom: 0,
				width: width,
			}}
		>
			<svg
				style={{
					width,
					height: width,
					overflow: 'visible',
				}}
				viewBox={`0 0 ${borderRadius} ${borderRadius}`}
			>
				<path fill={bgColor} d={d} />
			</svg>
		</div>
	);
};

const BottomRightCorner: React.FC<{
	bgColor: string;
	borderRadiusValue: number;
	widthDifference: number | undefined;
}> = ({bgColor, borderRadiusValue, widthDifference}) => {
	const {d, borderRadius, width} = getPathForCorner({
		corner: 'bottom-left',
		desiredBorderRadius: borderRadiusValue,
		widthDifference,
	});
	return (
		<div
			style={{
				position: 'absolute',
				right: -width,
				bottom: 0,
				width: width,
			}}
		>
			<svg
				style={{
					width,
					height: width,
					overflow: 'visible',
				}}
				viewBox={`0 0 ${borderRadius} ${borderRadius}`}
			>
				<path fill={bgColor} d={d} />
			</svg>
		</div>
	);
};

const TikTokTextLine: React.FC<{
	text: string;
	align?: React.CSSProperties['textAlign'];
	bgColor: string;
	borderRadius: string;
	className?: string;
	style?: React.CSSProperties;
	cornerRounding: CornerRounding;
	borderRadiusValue: number;
}> = ({
	text,
	align,
	bgColor,
	borderRadius,
	className,
	style,
	cornerRounding,
	borderRadiusValue,
}) => {
	return (
		<div style={{position: 'relative'}}>
			{cornerRounding.cornerTopLeft && (
				<TopLeftCorner
					bgColor={bgColor}
					borderRadiusValue={borderRadiusValue}
					widthDifference={cornerRounding.widthDifferenceToPrevious}
				/>
			)}
			{cornerRounding.cornerBottomLeft && (
				<BottomLeftCorner
					bgColor={bgColor}
					borderRadiusValue={borderRadiusValue}
					widthDifference={cornerRounding.widthDifferenceToNext}
				/>
			)}
			{cornerRounding.cornerTopRight && (
				<TopRightCorner
					bgColor={bgColor}
					borderRadiusValue={borderRadiusValue}
					widthDifference={cornerRounding.widthDifferenceToPrevious}
				/>
			)}
			{cornerRounding.cornerBottomRight && (
				<BottomRightCorner
					bgColor={bgColor}
					borderRadiusValue={borderRadiusValue}
					widthDifference={cornerRounding.widthDifferenceToNext}
				/>
			)}
			<div
				style={
					{
						textAlign: align,
						backgroundColor: bgColor ?? 'white',
						padding: `0px ${TIKTOK_TEXT_BOX_HORIZONTAL_PADDING}px`,
						borderRadius: borderRadius,
						width: 'fit-content',
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
	bgColor = 'white',
	textColor,
	borderRadius = 10,
}) => {
	const fontSize = 16;
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
				width: 'fit-content',
				lineHeight: 1.5,
				fontWeight,
			}}
		>
			{lines.map((line, i) => (
				<TikTokTextLine
					key={i}
					text={line}
					align={align}
					bgColor={bgColor}
					borderRadius={getBorderRadius(roundings[i], borderRadius)}
					style={{}}
					cornerRounding={roundings[i]}
					borderRadiusValue={borderRadius}
				/>
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
				bgColor="red"
			/>
			<TikTokTextBox
				lines={['Align Center', 'short', 'Third Line']}
				textAlign="center"
				fontFamily="Proxima Nova Semibold"
			/>
			<TikTokTextBox
				lines={['Align Right', 'with two lines', 'Third Line']}
				textAlign="right"
				bgColor="#FF683E"
				fontFamily="Proxima Nova Semibold"
				textColor="black"
			/>
			<TikTokTextBox
				lines={['short1', 'short']}
				textAlign="center"
				fontFamily="Proxima Nova Semibold"
			/>
		</div>
	);
};
