// Canvas and JavaScript color parsers need concrete colors rather than CSS var().
// Reuse the computed style for all colors in a draw to avoid repeated style reads.
export const resolveStudioColor = (
	color: string,
	computedStyle: CSSStyleDeclaration,
): string => {
	return color.replace(/var\((--remotion-studio-[a-z0-9-]+)\)/g, (_, name) => {
		return computedStyle.getPropertyValue(name).trim();
	});
};
