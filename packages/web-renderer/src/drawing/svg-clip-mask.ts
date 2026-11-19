import {createNativeMaskSvg} from './native-mask-svg';
import {turnSvgIntoDrawable} from './turn-svg-into-drawable';
import {withScaffoldVisible} from './with-scaffold-visible';

// Keep the original resource viewport and let the native HTML clipping driver
// interpret its geometry, visibility and reflected contours.
export const createSvgClipMask = ({
	resource,
	maskRect,
	precomposeRect,
	referenceRect,
	width,
	height,
}: {
	resource: SVGClipPathElement;
	maskRect: DOMRect;
	precomposeRect: DOMRect;
	referenceRect: DOMRect;
	width: number;
	height: number;
}) => {
	const namespace = 'http://www.w3.org/2000/svg';
	const {svg, target} = createNativeMaskSvg({
		ownerDocument: resource.ownerDocument,
		maskRect,
		precomposeRect,
		referenceRect,
		width,
		height,
	});
	target.style.clipPath = 'url(#remotion-svg-clip)';

	const clip = resource.cloneNode(true) as SVGClipPathElement;
	clip.id = 'remotion-svg-clip';
	const originals = Array.from(resource.children);
	withScaffoldVisible(resource, () => {
		for (let i = 0; i < originals.length; i++) {
			const original = originals[i] as SVGElement;
			const style = getComputedStyle(original);
			const child = clip.children[i] as SVGElement;
			child.style.clipRule = style.clipRule;
			child.style.display = style.display;
			child.style.visibility = style.visibility;
			if (original instanceof SVGRectElement) {
				for (const property of [
					'x',
					'y',
					'width',
					'height',
					'rx',
					'ry',
				] as const) {
					child.style.setProperty(
						property,
						style.getPropertyValue(property),
						'important',
					);
				}
			}
		}
	});

	const defs = resource.ownerDocument.createElementNS(namespace, 'defs');
	defs.appendChild(clip);
	const ownerViewport = resource.ownerSVGElement;
	if (ownerViewport) {
		const resourceViewport = resource.ownerDocument.createElementNS(
			namespace,
			'svg',
		);
		withScaffoldVisible(resource, () => {
			const style = getComputedStyle(ownerViewport);
			resourceViewport.setAttribute('width', style.width);
			resourceViewport.setAttribute('height', style.height);
		});
		for (const attribute of ['viewBox', 'preserveAspectRatio'] as const) {
			const value = ownerViewport.getAttribute(attribute);
			if (value !== null) resourceViewport.setAttribute(attribute, value);
		}

		resourceViewport.appendChild(defs);
		svg.insertBefore(resourceViewport, svg.firstChild);
	} else {
		svg.insertBefore(defs, svg.firstChild);
	}

	return turnSvgIntoDrawable(svg);
};
