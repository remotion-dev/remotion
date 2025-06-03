type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const magicCssBorderRadiusNumber = 0.5522847682119205;

export const getPathForCorner = (corner: Corner, borderRadius: number) => {
	if (corner === 'top-left') {
		const cp1X = borderRadius - magicCssBorderRadiusNumber * borderRadius;
		const cp1Y = 0;
		const cp2X = 0;
		const cp2Y = borderRadius - magicCssBorderRadiusNumber * borderRadius;
		const d = `M 0 0 L ${borderRadius} ${0} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} 0 ${borderRadius}`;
		return d;
	} else if (corner === 'top-right') {
		const cp1X = borderRadius - magicCssBorderRadiusNumber * borderRadius;
		const cp1Y = 0;
		const cp2X = borderRadius;
		const cp2Y = borderRadius - magicCssBorderRadiusNumber * borderRadius;
		const d = `M ${borderRadius} 0 L 0 ${0} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${borderRadius} ${borderRadius}`;
		return d;
	} else if (corner === 'bottom-left') {
		const cp1X = 0;
		const cp1Y = borderRadius - magicCssBorderRadiusNumber * borderRadius;
		const cp2X = borderRadius - magicCssBorderRadiusNumber * borderRadius;
		const cp2Y = borderRadius;
		const d = `M 0 ${borderRadius} L 0 0 C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${borderRadius} ${borderRadius}`;
		return d;
	} else if (corner === 'bottom-right') {
		const cp1X = borderRadius;
		const cp1Y = borderRadius - magicCssBorderRadiusNumber * borderRadius;
		const cp2X = borderRadius - magicCssBorderRadiusNumber * borderRadius;
		const cp2Y = borderRadius;
		const d = `M ${borderRadius} ${borderRadius} L ${borderRadius} 0 C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} 0 ${borderRadius}`;
		return d;
	}
};
