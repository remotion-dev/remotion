// A native HTML masking target with disjoint white reference and capture paint.
// Keep layout/reference padding separate so alpha edges are painted once.
export const createNativeMaskSvg = ({
	ownerDocument,
	maskRect,
	precomposeRect,
	referenceRect,
	width,
	height,
}: {
	ownerDocument: Document;
	maskRect: DOMRect;
	precomposeRect: DOMRect;
	referenceRect: DOMRect;
	width: number;
	height: number;
}) => {
	const namespace = 'http://www.w3.org/2000/svg';
	const svg = ownerDocument.createElementNS(namespace, 'svg');
	svg.setAttribute('width', String(width));
	svg.setAttribute('height', String(height));
	svg.setAttribute(
		'viewBox',
		`0 0 ${precomposeRect.width} ${precomposeRect.height}`,
	);
	const foreignObject = ownerDocument.createElementNS(
		namespace,
		'foreignObject',
	);
	foreignObject.setAttribute('x', '0');
	foreignObject.setAttribute('y', '0');
	foreignObject.setAttribute('width', String(precomposeRect.width));
	foreignObject.setAttribute('height', String(precomposeRect.height));
	const htmlNamespace = 'http://www.w3.org/1999/xhtml';
	const viewport = ownerDocument.createElementNS(
		htmlNamespace,
		'div',
	) as HTMLDivElement;
	Object.assign(viewport.style, {
		position: 'relative',
		width: `${precomposeRect.width}px`,
		height: `${precomposeRect.height}px`,
	});
	const target = ownerDocument.createElementNS(
		htmlNamespace,
		'div',
	) as HTMLDivElement;
	Object.assign(target.style, {
		position: 'absolute',
		left: `${maskRect.left - precomposeRect.left}px`,
		top: `${maskRect.top - precomposeRect.top}px`,
		width: `${maskRect.width}px`,
		height: `${maskRect.height}px`,
	});
	// Descendant layout and filter overflow determine the native reference box
	// in Firefox; the clipped element's own paint padding must not enlarge it.
	const white = ownerDocument.createElementNS(
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
	// Paint capture padding without overlapping the reference rectangle. Two
	// white surfaces otherwise blend antialiased clip edges twice in Firefox.
	const paint = ownerDocument.createElementNS(
		htmlNamespace,
		'div',
	) as HTMLDivElement;
	Object.assign(paint.style, {
		position: 'fixed',
		left: '0',
		top: '0',
		width: `${precomposeRect.width}px`,
		height: `${precomposeRect.height}px`,
		boxSizing: 'border-box',
		borderStyle: 'solid',
		borderColor: 'white',
		borderTopWidth: `${Math.max(0, referenceRect.top - precomposeRect.top)}px`,
		borderRightWidth: `${Math.max(0, precomposeRect.right - referenceRect.right)}px`,
		borderBottomWidth: `${Math.max(0, precomposeRect.bottom - referenceRect.bottom)}px`,
		borderLeftWidth: `${Math.max(0, referenceRect.left - precomposeRect.left)}px`,
	});
	target.appendChild(paint);
	viewport.appendChild(target);
	foreignObject.appendChild(viewport);
	svg.appendChild(foreignObject);
	return {svg, target};
};
