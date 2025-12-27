import type {BorderRadiusCorners} from './border-radius';
import {setBorderRadius} from './border-radius';

export const setOverflowHidden = ({
	ctx,
	rect,
	borderRadius,
	overflowHidden,
}: {
	ctx: OffscreenCanvasRenderingContext2D;
	rect: DOMRect;
	borderRadius: BorderRadiusCorners;
	overflowHidden: boolean;
}) => {
	if (!overflowHidden) {
		return () => {};
	}

	return setBorderRadius({
		ctx,
		rect,
		borderRadius,
		forceClipEvenWhenZero: true,
	});
};
