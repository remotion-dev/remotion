export const parseFilterOutsets = (
	filter: string,
): {left: number; right: number; top: number; bottom: number} => {
	const expansion = {left: 0, right: 0, top: 0, bottom: 0};

	// Match drop-shadow function with support for nested parentheses (e.g., rgba() inside drop-shadow())
	// getComputedStyle returns colors as rgb()/rgba(), so we need to handle one level of nesting
	const dropShadowRegex = /drop-shadow\(((?:[^()]+|\([^()]*\))+)\)/gi;
	let match;

	while ((match = dropShadowRegex.exec(filter)) !== null) {
		const params = match[1].trim();

		// Extract numeric values (offsets and blur)
		// The values can be in pixels, and we need to handle negative values
		const numbers: number[] = [];
		const numberRegex = /([+-]?\d*\.?\d+)(?:px)?/g;
		let numMatch;
		while ((numMatch = numberRegex.exec(params)) !== null) {
			// Skip if this is part of a color (like rgb values)
			const beforeMatch = params.slice(0, numMatch.index);
			if (!/(?:rgba?|hsla?)\([^)]*$/i.test(beforeMatch)) {
				numbers.push(parseFloat(numMatch[1]));
			}
		}

		// drop-shadow takes: offset-x, offset-y, [blur-radius]
		// Standard order is: offset-x offset-y blur color
		// or: offset-x offset-y color
		if (numbers.length >= 2) {
			const offsetX = numbers[0];
			const offsetY = numbers[1];
			const blurRadius = numbers.length >= 3 ? numbers[2] : 0;

			// Expand the rect to account for shadow offset and blur
			// CSS drop-shadow blur-radius is a Gaussian standard deviation
			// Visible extent is approximately 3σ, so we multiply by 3
			const blurSpread = blurRadius * 3;

			expansion.left += Math.max(0, blurSpread - offsetX);
			expansion.right += Math.max(0, blurSpread + offsetX);
			expansion.top += Math.max(0, blurSpread - offsetY);
			expansion.bottom += Math.max(0, blurSpread + offsetY);
		}
	}

	const blurRegex = /(?:^|\s)blur\(([^)]+)\)/g;
	while ((match = blurRegex.exec(filter)) !== null) {
		const spread = parseFloat(match[1]) * 3;
		expansion.left += spread;
		expansion.right += spread;
		expansion.top += spread;
		expansion.bottom += spread;
	}

	return expansion;
};
