interface TikTokTextBoxProps {
	lines: string[];
	align?: React.CSSProperties['textAlign'];
	fontFamily?: string;
	bgColor?: string;
	textColor?: string;
	className?: string;
	borderRadius?: number;
}

interface CornerRounding {
	TL: boolean;
	TR: boolean;
	BL: boolean;
	BR: boolean;
	classList: string[];
}

const getCornerRoundings = (
	lines: string[],
	align?: React.CSSProperties['textAlign'],
): CornerRounding[] => {
	const lengths = lines.map((line) => line.length);
	const n = lengths.length;

	return lines.map((_, i) => {
		const isFirst = i === 0;
		const isLast = i === n - 1;
		const prevLen = i > 0 ? lengths[i - 1] : undefined;
		const nextLen = i < n - 1 ? lengths[i + 1] : undefined;
		const currLen = lengths[i];

		// Determine rounded corners
		let TL = isFirst || (prevLen !== undefined && currLen > prevLen);
		let TR = TL;
		let BL = isLast || (nextLen !== undefined && currLen > nextLen);
		let BR = BL;

		if (!isFirst && !isLast) {
			if (align === 'left') {
				TL = BL = false;
			} else if (align === 'right') {
				TR = BR = false;
			}
		}

		// Build class list
		const classList: string[] = [];
		if (align === 'left') {
			if (!BR) classList.push('corner-br');
			if (!TR) classList.push('corner-tr');
		} else if (align === 'right') {
			if (!BL) classList.push('corner-bl');
			if (!TL) classList.push('corner-tl');
		} else if (align === 'center') {
			// LEFT side
			if (!TL && !BL) {
				classList.push('corner-left');
			} else {
				if (!TL) classList.push('corner-tl');
				if (!BL) classList.push('corner-bl');
			}
			// RIGHT side
			if (!TR && !BR) {
				classList.push('corner-right');
			} else {
				if (!TR) classList.push('corner-tr');
				if (!BR) classList.push('corner-br');
			}
		}

		return {TL, TR, BL, BR, classList};
	});
};

const getBorderRadius = (rounding: CornerRounding, radius: number) => {
	return [
		rounding.TL ? `${radius}px` : '0',
		rounding.TR ? `${radius}px` : '0',
		rounding.BR ? `${radius}px` : '0',
		rounding.BL ? `${radius}px` : '0',
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
	align,
	fontFamily,
	bgColor = 'white',
	textColor,
	borderRadius = 7,
}) => {
	const roundings = getCornerRoundings(lines, align);

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
				fontFamily: fontFamily,
				color: textColor ?? 'black',
				width: 'fit-content',
				lineHeight: 1,
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
				align="left"
				fontFamily="Arial"
				bgColor="red"
			/>
			<TikTokTextBox
				lines={['Align Center', 'short', 'Third Line']}
				align="center"
				fontFamily="Proxima Nova Semibold"
			/>
			<TikTokTextBox
				lines={['Align Right', 'with two lines', 'Third Line']}
				align="right"
				bgColor="#FF683E"
				textColor="black"
			/>
			<TikTokTextBox
				lines={['short1', 'short']}
				align="center"
				fontFamily="Proxima Nova Semibold"
			/>
		</div>
	);
};
