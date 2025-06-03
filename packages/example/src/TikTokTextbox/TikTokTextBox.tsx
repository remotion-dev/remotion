import {measureText, TextTransform} from '@remotion/layout-utils';
import {getPathForCorner} from './rounded-corner';

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
	currLength: number | undefined;
	prevLength: number | undefined;
	nextLength: number | undefined;
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
	borderRadius,
}: {
	lines: string[];
	fontFamily: string;
	fontSize: number;
	additionalStyles: React.CSSProperties;
	fontVariantNumeric: string;
	fontWeight: number;
	letterSpacing: string;
	textTransform: TextTransform;
	borderRadius: number;
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

		const borderRadiusToTakeIntoAccount =
			align === 'center' ? borderRadius / 2 : borderRadius;

		// Determine rounded corners
		let topLeft =
			isFirst ||
			(prevLen !== undefined &&
				currLen.width - borderRadiusToTakeIntoAccount > prevLen.width &&
				align !== 'left');
		let topRight =
			isFirst ||
			(prevLen !== undefined &&
				currLen.width - borderRadiusToTakeIntoAccount > prevLen.width &&
				align !== 'right');
		let bottomLeft =
			isLast ||
			(nextLen !== undefined &&
				currLen.width - borderRadiusToTakeIntoAccount > nextLen.width &&
				align !== 'left');
		let bottomRight =
			isLast ||
			(nextLen !== undefined &&
				currLen.width - borderRadiusToTakeIntoAccount > nextLen.width &&
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
			currLength: currLen?.width,
			prevLength: prevLen?.width,
			nextLength: nextLen?.width,
			align,
		};
		return roundings;
	});
};

const getBorderRadius = (rounding: CornerRounding, radius: number) => {
	return [
		rounding.topLeft ? `${radius}px` : '0',
		rounding.topRight ? `${radius}px` : '0',
		rounding.bottomRight ? `${radius}px` : '0',
		rounding.bottomLeft ? `${radius}px` : '0',
	].join(' ');
};

export const TIKTOK_TEXT_BOX_HORIZONTAL_PADDING = 10;

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
				<div
					style={{
						position: 'absolute',
						left: -borderRadiusValue,
						top: 0,
						width: borderRadiusValue,
					}}
				>
					<svg viewBox={`0 0 ${borderRadiusValue} ${borderRadiusValue}`}>
						<path
							fill={bgColor}
							d={getPathForCorner('top-right', borderRadiusValue)}
						/>
					</svg>
				</div>
			)}
			{cornerRounding.cornerBottomLeft && (
				<div
					style={{
						position: 'absolute',
						left: -borderRadiusValue,
						bottom: 0,
						width: borderRadiusValue,
					}}
				>
					<svg viewBox={`0 0 ${borderRadiusValue} ${borderRadiusValue}`}>
						<path
							fill={bgColor}
							d={getPathForCorner('bottom-right', borderRadiusValue)}
						/>
					</svg>
				</div>
			)}
			{cornerRounding.cornerTopRight && (
				<div
					style={{
						position: 'absolute',
						right: -borderRadiusValue,
						top: 0,
						width: borderRadiusValue,
					}}
				>
					<svg viewBox={`0 0 ${borderRadiusValue} ${borderRadiusValue}`}>
						<path
							fill={bgColor}
							d={getPathForCorner('top-left', borderRadiusValue)}
						/>
					</svg>
				</div>
			)}
			{cornerRounding.cornerBottomRight && (
				<div
					style={{
						position: 'absolute',
						right: -borderRadiusValue,
						bottom: 0,
						width: borderRadiusValue,
					}}
				>
					<svg viewBox={`0 0 ${borderRadiusValue} ${borderRadiusValue}`}>
						<path
							fill={bgColor}
							d={getPathForCorner('bottom-left', borderRadiusValue)}
						/>
					</svg>
				</div>
			)}
			<div
				style={
					{
						textAlign: align,
						backgroundColor: bgColor ?? 'white',
						padding: `10px ${TIKTOK_TEXT_BOX_HORIZONTAL_PADDING}px`,
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
	borderRadius = 7,
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
		borderRadius,
	});

	console.log({roundings});

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
				lineHeight: 1,
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
