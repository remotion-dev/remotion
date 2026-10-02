import {getBoxQuads as getBoxQuadsPolyfillInternals} from './get-box-quads-polyfill-internals.js';

export type GetBoxQuadsBox = 'margin' | 'border' | 'padding' | 'content';

export type GetBoxQuadsPonyfillOptions = {
	readonly box?: GetBoxQuadsBox;
	readonly relativeTo?: Element;
};

type ElementWithNativeGetBoxQuads = Element & {
	getBoxQuads?: (options?: GetBoxQuadsPonyfillOptions) => readonly DOMQuad[];
};

const hasNativeGetBoxQuads = (
	element: Element,
): element is ElementWithNativeGetBoxQuads => {
	return (
		typeof (element as ElementWithNativeGetBoxQuads).getBoxQuads === 'function'
	);
};

/**
 * Returns border/margin/padding/content box quads for an element.
 * Uses the native API when available, otherwise the getBoxQuads ponyfill.
 */
export const getBoxQuadsPonyfill = (
	element: Element,
	options?: GetBoxQuadsPonyfillOptions,
): readonly DOMQuad[] | null => {
	try {
		if (hasNativeGetBoxQuads(element)) {
			return element.getBoxQuads!(options);
		}

		return getBoxQuadsPolyfillInternals(element, options);
	} catch {
		return null;
	}
};
