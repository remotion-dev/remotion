import {splitAtTopLevel} from './background-image-rect';

export const parseFilterOutsets = (
	filter: string,
): {left: number; right: number; top: number; bottom: number} => {
	const expansion = {left: 0, right: 0, top: 0, bottom: 0};

	// Match drop-shadow function with support for nested parentheses (e.g., rgba() inside drop-shadow())
	// Computed colors can retain modern color functions inside drop-shadow().
	const dropShadowRegex = /drop-shadow\(((?:[^()]+|\([^()]*\))+)\)/gi;
	let match;

	while ((match = dropShadowRegex.exec(filter)) !== null) {
		const params = match[1].trim();

		// Color functions own their channel numbers. Only top-level length
		// tokens contribute shadow offsets and blur.
		const numbers = splitAtTopLevel(params, ' ')
			.map((value) => parseFloat(value))
			.filter(Number.isFinite);

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
