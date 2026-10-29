import {getMaskImageValue} from './mask-image';

const willChangeStackingContextProperties = new Set([
	'opacity',
	'transform',
	'translate',
	'scale',
	'rotate',
	'perspective',
	'filter',
	'backdrop-filter',
	'clip-path',
	'mask',
	'mask-image',
	'mix-blend-mode',
	'isolation',
	'z-index',
	'position',
	'contain',
]);

// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context#features_creating_stacking_contexts
// Every stacking context is an isolated group for mix-blend-mode.
const createsStackingContext = (element: Element) => {
	const style = getComputedStyle(element);

	if (style.zIndex !== 'auto') {
		if (style.position !== 'static') {
			return true;
		}

		const parentDisplay = element.parentElement
			? getComputedStyle(element.parentElement).display
			: '';
		if (parentDisplay.includes('flex') || parentDisplay.includes('grid')) {
			return true;
		}
	}

	return (
		style.position === 'fixed' ||
		style.position === 'sticky' ||
		parseFloat(style.opacity) < 1 ||
		style.transform !== 'none' ||
		style.translate !== 'none' ||
		style.scale !== 'none' ||
		style.rotate !== 'none' ||
		style.perspective !== 'none' ||
		style.transformStyle === 'preserve-3d' ||
		style.filter !== 'none' ||
		style.backdropFilter !== 'none' ||
		style.clipPath !== 'none' ||
		getMaskImageValue(style) !== null ||
		style.isolation === 'isolate' ||
		style.mixBlendMode !== 'normal' ||
		style.containerType === 'size' ||
		style.containerType === 'inline-size' ||
		/\b(paint|layout|strict|content)\b/.test(style.contain) ||
		style.willChange
			.split(',')
			.some((value) => willChangeStackingContextProperties.has(value.trim()))
	);
};

// An element with mix-blend-mode only blends with the content of the
// nearest ancestor stacking context.
export const getElementsNeedingIsolation = ({
	rootElement,
	acceptNode,
}: {
	rootElement: HTMLElement | SVGElement;
	acceptNode: (node: Node) => number;
}) => {
	const isolatedElements = new WeakSet<Element>();
	const treeWalker = document.createTreeWalker(
		rootElement,
		NodeFilter.SHOW_ELEMENT,
		acceptNode,
	);

	while (treeWalker.nextNode()) {
		const element = treeWalker.currentNode as Element;
		if (getComputedStyle(element).mixBlendMode === 'normal') {
			continue;
		}

		let ancestor = element.parentElement;
		while (ancestor && ancestor !== rootElement) {
			if (isolatedElements.has(ancestor)) {
				break;
			}

			if (createsStackingContext(ancestor)) {
				isolatedElements.add(ancestor);
				break;
			}

			ancestor = ancestor.parentElement;
		}
	}

	return isolatedElements;
};
