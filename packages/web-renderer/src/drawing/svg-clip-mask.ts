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
	const svg = resource.ownerDocument.createElementNS(namespace, 'svg');
	svg.setAttribute('width', String(width));
	svg.setAttribute('height', String(height));
	const x = precomposeRect.left - maskRect.left;
	const y = precomposeRect.top - maskRect.top;
	svg.setAttribute(
		'viewBox',
		`0 0 ${precomposeRect.width} ${precomposeRect.height}`,
	);
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
		svg.appendChild(resourceViewport);
	} else {
		svg.appendChild(defs);
	}

	const foreignObject = resource.ownerDocument.createElementNS(
		namespace,
		'foreignObject',
	);
	foreignObject.setAttribute('x', '0');
	foreignObject.setAttribute('y', '0');
	foreignObject.setAttribute('width', String(precomposeRect.width));
	foreignObject.setAttribute('height', String(precomposeRect.height));
	const htmlNamespace = 'http://www.w3.org/1999/xhtml';
	const viewport = resource.ownerDocument.createElementNS(
		htmlNamespace,
		'div',
	) as HTMLDivElement;
	Object.assign(viewport.style, {
		position: 'relative',
		width: `${precomposeRect.width}px`,
		height: `${precomposeRect.height}px`,
	});
	const target = resource.ownerDocument.createElementNS(
		htmlNamespace,
		'div',
	) as HTMLDivElement;
	Object.assign(target.style, {
		position: 'absolute',
		left: `${-x}px`,
		top: `${-y}px`,
		width: `${maskRect.width}px`,
		height: `${maskRect.height}px`,
		clipPath: 'url(#remotion-svg-clip)',
	});
	// Layout overflow determines the native reference box in Firefox; capture
	// padding for outlines, shadows and filters must not enlarge that box.
	const white = resource.ownerDocument.createElementNS(
		htmlNamespace,
		'div',
	) as HTMLDivElement;
	Object.assign(white.style, {
		position: 'absolute',
		left: `${referenceRect.left - maskRect.left}px`,
		top: `${referenceRect.top - maskRect.top}px`,
		width: `${referenceRect.width}px`,
		height: `${referenceRect.height}px`,
		backgroundColor: 'white',
	});
	target.appendChild(white);
	// A fixed paint surface covers filter outsets without contributing layout
	// overflow to the clipped target’s objectBoundingBox reference.
	const paint = resource.ownerDocument.createElementNS(
		htmlNamespace,
		'div',
	) as HTMLDivElement;
	Object.assign(paint.style, {
		position: 'fixed',
		left: '0',
		top: '0',
		width: `${precomposeRect.width}px`,
		height: `${precomposeRect.height}px`,
		backgroundColor: 'white',
	});
	target.appendChild(paint);
	viewport.appendChild(target);
	foreignObject.appendChild(viewport);
	svg.appendChild(foreignObject);
	return turnSvgIntoDrawable(svg);
};
