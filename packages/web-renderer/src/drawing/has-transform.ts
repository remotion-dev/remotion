export const hasTransformCssValue = (
	style: Pick<CSSStyleDeclaration, 'transform'>,
) => {
	return style.transform !== 'none' && style.transform !== '';
};

export const hasRotateCssValue = (
	style: Pick<CSSStyleDeclaration, 'rotate'>,
) => {
	return style.rotate !== 'none' && style.rotate !== '';
};

export const hasScaleCssValue = (style: Pick<CSSStyleDeclaration, 'scale'>) => {
	return style.scale !== 'none' && style.scale !== '';
};

export const hasAnyTransformCssValue = (
	style: Pick<CSSStyleDeclaration, 'rotate' | 'scale' | 'transform'>,
) => {
	return (
		hasTransformCssValue(style) ||
		hasRotateCssValue(style) ||
		hasScaleCssValue(style)
	);
};
