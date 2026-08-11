/**
 * Parse paint-order CSS property to determine if stroke should be drawn before fill.
 * Default order is: fill, stroke, markers
 * paintOrder can be "normal", "fill", "stroke", "fill stroke", "stroke fill", etc.
 */
export const parsePaintOrder = (paintOrder: string): {strokeFirst: boolean} => {
	const paintOrderValue = paintOrder || 'normal';
	const paintOrderParts =
		paintOrderValue === 'normal'
			? ['fill', 'stroke']
			: paintOrderValue.split(/\s+/).filter(Boolean);

	// Determine order - if 'stroke' appears before 'fill', draw stroke first
	const strokeIndex = paintOrderParts.indexOf('stroke');
	const fillIndex = paintOrderParts.indexOf('fill');
	const strokeFirst =
		strokeIndex !== -1 && (fillIndex === -1 || strokeIndex < fillIndex);

	return {strokeFirst};
};
