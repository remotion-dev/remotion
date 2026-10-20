import {getBoxQuads as getBoxQuadsPolyfillInternals} from './get-box-quads-polyfill-internals.js';

export type GetBoxQuadsBox = 'margin' | 'border' | 'padding' | 'content';

export type GetBoxQuadsPonyfillOptions = {
	readonly box?: GetBoxQuadsBox;
	readonly relativeTo?: Element;
};

type NodeWithNativeGetBoxQuads = (Element | Text) & {
	getBoxQuads?: (options?: GetBoxQuadsPonyfillOptions) => readonly DOMQuad[];
};

const hasNativeGetBoxQuads = (
	element: Element | Text,
): element is NodeWithNativeGetBoxQuads => {
	return (
		typeof (element as NodeWithNativeGetBoxQuads).getBoxQuads === 'function'
	);
};

/**
 * Returns border/margin/padding/content box quads for elements and text fragments.
 * Uses the native API when available, otherwise the getBoxQuads ponyfill.
 */
export const getBoxQuadsPonyfill = (
	element: Element | Text,
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
