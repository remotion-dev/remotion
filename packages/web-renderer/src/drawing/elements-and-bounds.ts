import type {Precompositing} from './calculate-transforms';

export type ElementAndBounds = {
	element: Element;
	bounds: DOMRect;
	transform: DOMMatrix;
	parentRect: DOMRect;
	precompositing: Precompositing;
};
