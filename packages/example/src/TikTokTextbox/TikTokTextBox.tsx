/**
 * Based on https://discord.com/channels/809501355504959528/833092843290624050/1375320798969200660
 * and improved: https://discord.com/channels/809501355504959528/833092843290624050/1379446302903107624
 */

import {getBoundingBox} from '@remotion/paths';
import {CornerRounding, getCornerRoundings} from './get-corner-roundings';
import {getActualBorderRadius, getPathForCorner} from './rounded-corner';
import {makeSvg} from './svg';

interface TikTokTextBoxProps {
	lines: string[];
	textAlign: 'left' | 'center' | 'right';
	fontFamily: string;
	bgColor?: string;
	textColor?: string;
	className?: string;
	borderRadius?: number;
	fontSize: number;
}

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
				width: 'fit-content',
				lineHeight: 1.5,
				fontWeight,
				position: 'relative',
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
			<svg
				viewBox={boundingBox.viewBox}
				style={{
					position: 'absolute',
					width: boundingBox.width,
					height: boundingBox.height,
				}}
			>
				<path d={svg} fill="rgba(255, 0, 0, 0.5)" />
			</svg>
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
				bgColor="#FF683E"
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
