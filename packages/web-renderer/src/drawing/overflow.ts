import type {BorderRadiusCorners} from './border-radius';
import {setBorderRadius} from './border-radius';

export const setOverflowHidden = ({
	ctx,
	rect,
	borderRadius,
	overflowHidden,
	computedStyle,
	backgroundClip,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	borderRadius: BorderRadiusCorners;
	overflowHidden: boolean;
	computedStyle: CSSStyleDeclaration;
	backgroundClip: string;
}) => {
	if (!overflowHidden) {
		return () => {};
	}

	return setBorderRadius({
		ctx,
		rect,
		borderRadius,
		forceClipEvenWhenZero: true,
		computedStyle,
		backgroundClip,
	});
};
