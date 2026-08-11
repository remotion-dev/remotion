export interface ShadowBase {
	offsetX: number;
	offsetY: number;
	blurRadius: number;
	color: string;
}

export const parseShadowValues = (shadowValue: string): ShadowBase[] => {
	if (!shadowValue || shadowValue === 'none') {
		return [];
	}

	const shadows: ShadowBase[] = [];

	// Split by comma, but respect rgba() colors
	const shadowStrings = shadowValue.split(/,(?![^(]*\))/);

	for (const shadowStr of shadowStrings) {
		const trimmed = shadowStr.trim();
		if (!trimmed || trimmed === 'none') {
			continue;
		}

		const shadow: ShadowBase = {
			offsetX: 0,
			offsetY: 0,
			blurRadius: 0,
			color: 'rgba(0, 0, 0, 0.5)',
		};

		// Remove 'inset' keyword (only relevant for box-shadow, but strip it
		// so it doesn't interfere with color matching)
		let remaining = trimmed.replace(/\binset\b/gi, '').trim();

		// Extract color (can be rgb(), rgba(), hsl(), hsla(), hex, or named color)
		const colorMatch = remaining.match(
			/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-f]{3,8}|[a-z]+)/i,
		);
		if (colorMatch) {
			shadow.color = colorMatch[0];
			remaining = remaining.replace(colorMatch[0], '').trim();
		}

		// Parse remaining numeric values (offset-x offset-y blur-radius [spread])
		const numbers = remaining.match(/[+-]?\d*\.?\d+(?:px|em|rem|%)?/gi) || [];
		const values = numbers.map((n) => parseFloat(n) || 0);

		if (values.length >= 2) {
			shadow.offsetX = values[0];
			shadow.offsetY = values[1];

			if (values.length >= 3) {
				shadow.blurRadius = Math.max(0, values[2]);
			}
		}

		shadows.push(shadow);
	}

	return shadows;
};
