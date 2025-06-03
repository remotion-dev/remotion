import {measureText, TextTransform} from '@remotion/layout-utils';

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
	classList: string[];
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

		// Determine rounded corners
		let topLeft =
			isFirst || (prevLen !== undefined && currLen.width > prevLen.width);
		let topRight = topLeft;
		let bottomLeft =
			isLast || (nextLen !== undefined && currLen.width > nextLen.width);
		let bottomRight =
			isLast || (nextLen !== undefined && currLen.width > nextLen.width);

		if (!isFirst && !isLast) {
			if (align === 'left') {
				topLeft = bottomLeft = false;
			} else if (align === 'right') {
				topRight = bottomRight = false;
			}
		}

		// Build class list
		const classList: string[] = [];
		if (align === 'left') {
			if (!bottomRight) classList.push('corner-br');
			if (!topRight) classList.push('corner-tr');
		} else if (align === 'right') {
			if (!bottomLeft) classList.push('corner-bl');
			if (!topLeft) classList.push('corner-tl');
		} else if (align === 'center') {
			// LEFT side
			if (!topLeft && !bottomLeft) {
				classList.push('corner-left');
			} else {
				if (!topLeft) classList.push('corner-tl');
				if (!bottomLeft) classList.push('corner-bl');
			}
			// RIGHT side
			if (!topRight && !bottomRight) {
				classList.push('corner-right');
			} else {
				if (!topRight) classList.push('corner-tr');
				if (!bottomRight) classList.push('corner-br');
			}
		}

		const roundings: CornerRounding = {
			topLeft: topLeft,
			topRight: topRight,
			bottomLeft: bottomLeft,
			bottomRight: bottomRight,
			classList,
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
		<div
			style={
				{
					position: 'relative',
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
			{cornerRounding.classList.includes('corner-tl') && (
				<div
					style={{
						position: 'absolute',
						left: -borderRadiusValue,
						top: 0,
						width: borderRadiusValue,
						height: '100%',
						borderTopRightRadius: borderRadiusValue,
						boxShadow: `0px -${borderRadiusValue * 2}px 0 ${bgColor}`,
					}}
				/>
			)}
			{cornerRounding.classList.includes('corner-bl') && (
				<div
					style={{
						position: 'absolute',
						left: -borderRadiusValue,
						top: 0,
						width: borderRadiusValue,
						height: '100%',
						borderBottomRightRadius: borderRadiusValue,
						boxShadow: `0px ${borderRadiusValue * 2}px 0 ${bgColor}`,
					}}
				/>
			)}
			{cornerRounding.classList.includes('corner-tr') && (
				<div
					style={{
						position: 'absolute',
						right: -borderRadiusValue,
						top: 0,
						width: borderRadiusValue,
						height: '100%',
						borderTopLeftRadius: borderRadiusValue,
						boxShadow: `0px -${borderRadiusValue * 2}px 0 ${bgColor}`,
					}}
				/>
			)}
			{cornerRounding.classList.includes('corner-br') && (
				<div
					style={{
						position: 'absolute',
						right: -borderRadiusValue,
						top: 0,
						width: borderRadiusValue,
						height: '100%',
						borderBottomLeftRadius: borderRadiusValue,
						boxShadow: `0px ${borderRadiusValue * 2}px 0 ${bgColor}`,
					}}
				/>
			)}
			{cornerRounding.classList.includes('corner-left') && (
				<div
					style={{
						position: 'absolute',
						left: -borderRadiusValue,
						top: 0,
						width: borderRadiusValue,
						height: '100%',
						borderTopRightRadius: borderRadiusValue,
						borderBottomRightRadius: borderRadiusValue,
						boxShadow: `0 -${borderRadiusValue}px 0 ${bgColor}, 0 ${borderRadiusValue}px 0 ${bgColor}`,
					}}
				/>
			)}
			{cornerRounding.classList.includes('corner-right') && (
				<div
					style={{
						position: 'absolute',
						right: -borderRadiusValue,
						top: 0,
						width: borderRadiusValue,
						height: '100%',
						borderTopLeftRadius: borderRadiusValue,
						borderBottomLeftRadius: borderRadiusValue,
						boxShadow: `0 -${borderRadiusValue}px 0 ${bgColor}, 0 ${borderRadiusValue}px 0 ${bgColor}`,
					}}
				/>
			)}
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
					className={`tiktok-text-line ${roundings[i].classList.join(' ')}`}
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
