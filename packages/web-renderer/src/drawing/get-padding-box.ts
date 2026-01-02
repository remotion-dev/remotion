const getPaddingBox = (
	rect: DOMRect,
	computedStyle: CSSStyleDeclaration,
): DOMRect => {
	const borderLeft = parseFloat(computedStyle.borderLeftWidth);
	const borderRight = parseFloat(computedStyle.borderRightWidth);
	const borderTop = parseFloat(computedStyle.borderTopWidth);
	const borderBottom = parseFloat(computedStyle.borderBottomWidth);

	return new DOMRect(
		rect.left + borderLeft,
		rect.top + borderTop,
		rect.width - borderLeft - borderRight,
		rect.height - borderTop - borderBottom,
	);
};

const getContentBox = (
	rect: DOMRect,
	computedStyle: CSSStyleDeclaration,
): DOMRect => {
	const paddingBox = getPaddingBox(rect, computedStyle);
	const paddingLeft = parseFloat(computedStyle.paddingLeft);
	const paddingRight = parseFloat(computedStyle.paddingRight);
	const paddingTop = parseFloat(computedStyle.paddingTop);
	const paddingBottom = parseFloat(computedStyle.paddingBottom);

	return new DOMRect(
		paddingBox.left + paddingLeft,
		paddingBox.top + paddingTop,
		paddingBox.width - paddingLeft - paddingRight,
		paddingBox.height - paddingTop - paddingBottom,
	);
};

export const getBoxBasedOnBackgroundClip = (
	rect: DOMRect,
	computedStyle: CSSStyleDeclaration,
	backgroundClip: string,
) => {
	if (backgroundClip.includes('text')) {
		return [rect];
	}

	if (backgroundClip.includes('padding-box')) {
		return [getPaddingBox(rect, computedStyle)];
	}

	if (backgroundClip.includes('content-box')) {
		return [getContentBox(rect, computedStyle)];
	}

	return [rect, getPaddingBox(rect, computedStyle)];
};
