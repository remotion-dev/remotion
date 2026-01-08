export const hasTransformCssValue = (style: CSSStyleDeclaration) => {
	return style.transform !== 'none' && style.transform !== '';
};

export const hasRotateCssValue = (style: CSSStyleDeclaration) => {
	return style.rotate !== 'none' && style.rotate !== '';
};

export const hasScaleCssValue = (style: CSSStyleDeclaration) => {
	return style.scale !== 'none' && style.scale !== '';
};

export const hasPerspectiveCssValue = (style: CSSStyleDeclaration) => {
	return style.perspective !== 'none' && style.perspective !== '';
};

export const hasAnyTransformCssValue = (style: CSSStyleDeclaration) => {
	return (
		hasTransformCssValue(style) ||
		hasRotateCssValue(style) ||
		hasScaleCssValue(style) ||
		hasPerspectiveCssValue(style)
	);
};
