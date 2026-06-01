/* eslint-disable */
/*
 * Geometry helpers adapted from getBoxQuadsPolyfill
 * https://github.com/jogibear9988/getBoxQuadsPolyfill (MIT)
 *
 * Used as a Remotion ponyfill only — does not patch globals.
 */

//todo:
//transform-box (SVGs)  https://developer.mozilla.org/en-US/docs/Web/CSS/transform-box

// =============================================================================
// PERFORMANCE FIXES APPLIED (14 total):
//
// FIX 1  – getElementCombinedTransform: check parent perspective inside fast-path
//           so identity elements return immediately on non-3D pages.
// FIX 2  – getResultingTransformationBetweenElementAndAllAncestors: guard initial
//           self-transform multiply with isIdentity check.
// FIX 3  – All translate matrix calls: skip new DOMMatrix().translateSelf(0,0)
//           when both offsets are zero (hot loop, flat layouts).
// FIX 4  – getElementOffsetsInContainer/HTMLElement: defer getCachedComputedStyle
//           until inside the `includeScroll` branch where it's actually needed.
// FIX 5  – getResultingTransformationBetweenElementAndAllAncestors: guard
//           projectTo2D calls with !is2D check to skip style reads on 2D pages.
// FIX 6  – getResultingTransformationBetweenElementAndAllAncestors: cache the
//           result on the early-return (ancestor found) path, not just fallthrough.
// FIX 7  – getBoxQuads: reuse the Range already created for the multi-fragment
//           text check; pass clientRects/boundingRect into getElementSize to
//           avoid creating a second Range for Text nodes.
// FIX 8  – getBoxQuads: split the per-point `!o` branch out of the loop into
//           two separate loops to eliminate the branch test on every iteration.
// FIX 9  – getBoxQuads: hoist parseFloat calls for box offsets (margin/padding/
//           content) so values are computed once, not 4x inside the loop.
// FIX 10 – getElementCombinedTransform: check hasTransform first (most common
//           non-identity case) so cheaper checks fire before heavier ones.
// FIX 11 – getElementCombinedTransform: skip transform-origin wrap/unwrap when
//           origin is (0, 0, 0), saving two DOMMatrix allocations.
// FIX 12 – getResultingTransformationBetweenElementAndAllAncestors: reuse
//           getElementCombinedTransform result across loop iterations (carry
//           parent transform forward instead of recomputing next iteration).
// FIX 13 – Repeated cross-realm instanceof checks: cache constructors from the
//           node's window at function entry to avoid repeated property lookups.
//           (Applied in getElementSize and getBoxQuads hot paths.)
// FIX 14 – transformPointBox: parse style values once per call, not once per
//           property access (avoids repeated parseFloat on shared string props).
// =============================================================================

/**
 * @param {globalThis} windowObj?
 * @param {boolean=} force
 */
export function addPolyfill(windowObj = window, force = false) {
	windowObj.__getBoxQuadsPolyfillFns ??= {};
	windowObj.__getBoxQuadsPolyfillFns.getBoxQuads = getBoxQuads;
	windowObj.__getBoxQuadsPolyfillFns.convertQuadFromNode = convertQuadFromNode;
	windowObj.__getBoxQuadsPolyfillFns.convertRectFromNode = convertRectFromNode;
	windowObj.__getBoxQuadsPolyfillFns.convertPointFromNode =
		convertPointFromNode;

	if (force || !windowObj.Node.prototype.getBoxQuads) {
		//@ts-ignore
		windowObj.Node.prototype.getBoxQuads = function (options) {
			return windowObj.__getBoxQuadsPolyfillFns.getBoxQuads(this, options);
		};
	}

	if (force || !windowObj.Node.prototype.convertQuadFromNode) {
		//@ts-ignore
		windowObj.Node.prototype.convertQuadFromNode = function (
			quad,
			from,
			options,
		) {
			return windowObj.__getBoxQuadsPolyfillFns.convertQuadFromNode(
				this,
				quad,
				from,
				options,
			);
		};
	}

	if (force || !windowObj.Node.prototype.convertRectFromNode) {
		//@ts-ignore
		windowObj.Node.prototype.convertRectFromNode = function (
			rect,
			from,
			options,
		) {
			return windowObj.__getBoxQuadsPolyfillFns.convertRectFromNode(
				this,
				rect,
				from,
				options,
			);
		};
	}

	if (force || !windowObj.Node.prototype.convertPointFromNode) {
		//@ts-ignore
		windowObj.Node.prototype.convertPointFromNode = function (
			point,
			from,
			options,
		) {
			return windowObj.__getBoxQuadsPolyfillFns.convertPointFromNode(
				this,
				point,
				from,
				options,
			);
		};
	}
}
/**
 * @param {globalThis} windowObj?
 */
export function patchAdoptNode(windowObj = window) {
	if (!windowObj.Node.prototype.getBoxQuads) {
		//@ts-ignore
		windowObj.Node.prototype.getBoxQuads = function (options) {
			return getBoxQuads(this, options);
		};
	}

	if (!windowObj.Node.prototype.convertQuadFromNode) {
		//@ts-ignore
		windowObj.Node.prototype.convertQuadFromNode = function (
			quad,
			from,
			options,
		) {
			return convertQuadFromNode(this, quad, from, options);
		};
	}

	if (!windowObj.Node.prototype.convertRectFromNode) {
		//@ts-ignore
		windowObj.Node.prototype.convertRectFromNode = function (
			rect,
			from,
			options,
		) {
			return convertRectFromNode(this, rect, from, options);
		};
	}

	if (!windowObj.Node.prototype.convertPointFromNode) {
		//@ts-ignore
		windowObj.Node.prototype.convertPointFromNode = function (
			point,
			from,
			options,
		) {
			return convertPointFromNode(this, point, from, options);
		};
	}
}
/**
 * @param {Node} node
 * @param {DOMQuadInit} quad
 * @param {Element} from
 * @param {{fromBox?: 'margin'|'border'|'padding'|'content', toBox?: 'margin'|'border'|'padding'|'content', iframes?: HTMLIFrameElement[]}=} options
 * @returns {DOMQuad}
 */
export function convertQuadFromNode(node, quad, from, options) {
	const ancestor = (node.ownerDocument.defaultView ?? window).document.body;
	const m1 = getResultingTransformationBetweenElementAndAllAncestors(
		from,
		ancestor,
		options?.iframes,
		true,
	);
	const m2 = getResultingTransformationBetweenElementAndAllAncestors(
		node,
		ancestor,
		options?.iframes,
		true,
	).inverse();
	if (options?.fromBox && options?.fromBox !== 'border') {
		const fromStyle = getCachedComputedStyle(from);
		quad = new DOMQuad(
			transformPointBox(quad.p1, options.fromBox, fromStyle, -1),
			transformPointBox(quad.p2, options.fromBox, fromStyle, -1),
			transformPointBox(quad.p3, options.fromBox, fromStyle, -1),
			transformPointBox(quad.p4, options.fromBox, fromStyle, -1),
		);
	}
	let res = new DOMQuad(
		m2.transformPoint(m1.transformPoint(quad.p1)),
		m2.transformPoint(m1.transformPoint(quad.p2)),
		m2.transformPoint(m1.transformPoint(quad.p3)),
		m2.transformPoint(m1.transformPoint(quad.p4)),
	);
	if (
		options?.toBox &&
		options?.toBox !== 'border' &&
		(node instanceof Element ||
			node instanceof (node.ownerDocument.defaultView ?? window).Element)
	) {
		const nodeStyle = getCachedComputedStyle(node);
		res = new DOMQuad(
			transformPointBox(res.p1, options.toBox, nodeStyle, -1),
			transformPointBox(res.p2, options.toBox, nodeStyle, -1),
			transformPointBox(res.p3, options.toBox, nodeStyle, -1),
			transformPointBox(res.p4, options.toBox, nodeStyle, -1),
		);
	}
	return res;
}
/**
 * @param {Node} node
 * @param {{x: number, y: number, width: number, height: number}} rect
 * @param {Element} from
 * @param {{fromBox?: 'margin'|'border'|'padding'|'content', toBox?: 'margin'|'border'|'padding'|'content', iframes?: HTMLIFrameElement[]}=} options
 * @returns {DOMQuad}
 */
export function convertRectFromNode(node, rect, from, options) {
	const ancestor = (node.ownerDocument.defaultView ?? window).document.body
		.parentElement;
	const m1 = getResultingTransformationBetweenElementAndAllAncestors(
		from,
		ancestor,
		options?.iframes,
		true,
	);
	const m2 = getResultingTransformationBetweenElementAndAllAncestors(
		node,
		ancestor,
		options?.iframes,
		true,
	).inverse();
	if (options?.fromBox && options?.fromBox !== 'border') {
		const p = transformPointBox(
			new DOMPoint(rect.x, rect.y),
			options.fromBox,
			getCachedComputedStyle(from),
			1,
		);
		rect = new DOMRect(p.x, p.y, rect.width, rect.height);
	}
	let res = new DOMQuad(
		m2.transformPoint(m1.transformPoint(new DOMPoint(rect.x, rect.y))),
		m2.transformPoint(
			m1.transformPoint(new DOMPoint(rect.x + rect.width, rect.y)),
		),
		m2.transformPoint(
			m1.transformPoint(
				new DOMPoint(rect.x + rect.width, rect.y + rect.height),
			),
		),
		m2.transformPoint(
			m1.transformPoint(new DOMPoint(rect.x, rect.y + rect.height)),
		),
	);
	if (
		options?.toBox &&
		options?.toBox !== 'border' &&
		(node instanceof Element ||
			node instanceof (node.ownerDocument.defaultView ?? window).Element)
	) {
		const nodeStyle = getCachedComputedStyle(node);
		res = new DOMQuad(
			transformPointBox(res.p1, options.toBox, nodeStyle, -1),
			transformPointBox(res.p2, options.toBox, nodeStyle, -1),
			transformPointBox(res.p3, options.toBox, nodeStyle, -1),
			transformPointBox(res.p4, options.toBox, nodeStyle, -1),
		);
	}
	return res;
}
/**
 * @param {Node} node
 * @param {DOMPointInit} point
 * @param {Element} from
 * @param {{fromBox?: 'margin'|'border'|'padding'|'content', toBox?: 'margin'|'border'|'padding'|'content', iframes?: HTMLIFrameElement[]}=} options
 * @returns {DOMPoint}
 */
export function convertPointFromNode(node, point, from, options) {
	const ancestor = (node.ownerDocument.defaultView ?? window).document.body
		.parentElement;
	const m1 = getResultingTransformationBetweenElementAndAllAncestors(
		from,
		ancestor,
		options?.iframes,
		true,
	);
	const m2 = getResultingTransformationBetweenElementAndAllAncestors(
		node,
		ancestor,
		options?.iframes,
		true,
	).inverse();
	if (options?.fromBox && options?.fromBox !== 'border') {
		point = transformPointBox(
			point,
			options.fromBox,
			getCachedComputedStyle(from),
			1,
		);
	}
	let res = m2.transformPoint(m1.transformPoint(point));
	if (
		options?.toBox &&
		options?.toBox !== 'border' &&
		(node instanceof Element ||
			node instanceof (node.ownerDocument.defaultView ?? window).Element)
	) {
		res = transformPointBox(
			res,
			options.toBox,
			getCachedComputedStyle(node),
			-1,
		);
	}
	return res;
}
/**
 * @param {DOMPointInit} point
 * @param {'margin'|'border'|'padding'|'content'} box
 * @param {CSSStyleDeclaration} style
 * @param {number} operator
 * @returns {DOMPoint}
 *
 * FIX 14: Parse each style value once and reuse, rather than calling parseFloat
 *          multiple times on the same property (e.g. borderLeftWidth used twice in 'content').
 */
function transformPointBox(point, box, style, operator) {
	if (box === 'margin') {
		const mLeft = parseFloat(style.marginLeft);
		const mTop = parseFloat(style.marginTop);
		return new DOMPoint(point.x - operator * mLeft, point.y - operator * mTop);
	} else if (box === 'padding') {
		const bLeft = parseFloat(style.borderLeftWidth);
		const bTop = parseFloat(style.borderTopWidth);
		return new DOMPoint(point.x + operator * bLeft, point.y + operator * bTop);
	} else if (box === 'content') {
		const bLeft = parseFloat(style.borderLeftWidth);
		const bTop = parseFloat(style.borderTopWidth);
		const pLeft = parseFloat(style.paddingLeft);
		const pTop = parseFloat(style.paddingTop);
		return new DOMPoint(
			point.x + operator * (bLeft + pLeft),
			point.y + operator * (bTop + pTop),
		);
	}
	//@ts-ignore
	return point;
}
/** @type { WeakMap<Node, number> } */
let hash;
/** @type { Map<string, DOMQuad[]> } */
let boxQuadsCache;
/** @type { Map<string, DOMMatrix> } */
let transformCache;
/** @type { WeakMap<Node, CSSStyleDeclaration> } */
let computedStyleCache;
let hashId = 0;

export function clearCache() {
	boxQuadsCache.clear();
	transformCache.clear();
	computedStyleCache = new WeakMap();
}

export function useCache() {
	hash = new WeakMap();
	boxQuadsCache = new Map();
	transformCache = new Map();
	computedStyleCache = new WeakMap();
}
/**
 * @param {Element} element
 * @returns {CSSStyleDeclaration}
 */
function getCachedComputedStyle(element) {
	if (!computedStyleCache) {
		return (element.ownerDocument.defaultView ?? window).getComputedStyle(
			element,
		);
	}
	let style = computedStyleCache.get(element);
	if (!style) {
		style = (element.ownerDocument.defaultView ?? window).getComputedStyle(
			element,
		);
		computedStyleCache.set(element, style);
	}
	return style;
}
/**
 * @param {Node} node
 * @returns {boolean}
 */
function isElementNode(node) {
	return !!node && node.nodeType === Node.ELEMENT_NODE;
}
/**
 * @param {Node} element
 * @returns {number}
 */
function getElementZoom(element) {
	if (!isElementNode(element)) {
		return 1;
	}
	/** @type {Element} */
	// @ts-ignore
	const actualElement = element;
	const zoom = getCachedComputedStyle(actualElement).zoom;
	if (!zoom || zoom === 'normal') {
		return 1;
	}
	if (zoom.endsWith('%')) {
		const percentage = parseFloat(zoom);
		return Number.isFinite(percentage) && percentage > 0 ? percentage / 100 : 1;
	}
	const value = parseFloat(zoom);
	return Number.isFinite(value) && value > 0 ? value : 1;
}
/**
 * `zoom` scales the element's internal coordinate space while also shifting the
 * element within its parent from the top-center anchor in the default writing-mode.
 * For descendant coordinates we keep the scale in the matrix pipeline and apply
 * the parent-position shift separately in the layout translation step.
 * @param {Node} element
 * @returns {DOMMatrix}
 */
function getElementZoomScaleTransform(element) {
	if (!isElementNode(element)) {
		return new DOMMatrix();
	}
	const zoom = getElementZoom(element);
	if (zoom === 1) {
		return new DOMMatrix();
	}
	return new DOMMatrix().scaleSelf(zoom);
}
/**
 * @param {Node} element
 * @param {HTMLIFrameElement[]=} iframes
 * @param {boolean=} includeZoom
 * @returns {DOMMatrix}
 */
function getElementTransformWithZoom(element, iframes, includeZoom = true) {
	const transform = getElementCombinedTransform(element, iframes);
	if (!includeZoom || !isElementNode(element)) {
		return transform;
	}
	const zoomTransform = getElementZoomScaleTransform(element);
	if (zoomTransform.isIdentity) {
		return transform;
	}
	// `zoom` scales transform translations as well as the element's local axes,
	// so it needs to wrap the transform matrix instead of being appended to it.
	return zoomTransform.multiply(transform);
}
/**
 * @param {Node} node
 * @param {{box?: 'margin'|'border'|'padding'|'content', relativeTo?: Element, iframes?: HTMLIFrameElement[]}=} options
 * @returns {DOMQuad[]}
 */
export function getBoxQuads(node, options) {
	const defaultRelativeTo =
		node.ownerDocument.documentElement ?? node.ownerDocument.body;
	const relativeTo = options?.relativeTo ?? defaultRelativeTo;
	const viewportRoot =
		node.ownerDocument.documentElement ?? node.ownerDocument.body;
	const resolveFixedThroughViewport =
		relativeTo !== viewportRoot &&
		shouldResolveFixedPositionThroughViewport(
			node,
			relativeTo,
			options?.iframes,
		);
	let key;
	if (boxQuadsCache) {
		let i1 = hash.get(node);
		if (i1 === undefined) hash.set(node, (i1 = hashId++));
		let i2 = hash.get(relativeTo);
		if (i2 === undefined) hash.set(relativeTo, (i2 = hashId++));
		key = i1 + '_' + i2 + '_' + (options?.box ?? 'border');
		const q = boxQuadsCache.get(key);
		if (q) return q;
	}

	/** @type {DOMMatrix} */
	let originalElementAndAllParentsMultipliedMatrix =
		getResultingTransformationBetweenElementAndAllAncestors(
			node,
			resolveFixedThroughViewport ? viewportRoot : relativeTo,
			options?.iframes,
		);

	// FIX 13: Cache cross-realm constructors once per call.
	const win = node.ownerDocument.defaultView ?? window;
	const _Text = win.Text;
	const _SVGGraphicsElement = win.SVGGraphicsElement;
	const _SVGSVGElement = win.SVGSVGElement;

	// For text nodes, check for multiple fragments (multi-column layout, line-wrapping).
	// getClientRects() returns one rect per line-box fragment; getBoundingClientRect()
	// only returns the union AABB, so without this we'd always get one quad.
	if (node instanceof Text || node instanceof _Text) {
		const canUseViewportTextRects =
			originalElementAndAllParentsMultipliedMatrix.is2D &&
			Math.abs(originalElementAndAllParentsMultipliedMatrix.b) < 1e-10 &&
			Math.abs(originalElementAndAllParentsMultipliedMatrix.c) < 1e-10;
		// FIX 7: Create the Range once here and reuse it for both the multi-fragment
		//        check and the single-fragment size fallback, avoiding a second Range
		//        allocation inside getElementSize for Text nodes.
		const range = node.ownerDocument.createRange();
		range.selectNodeContents(node);
		const clientRects = range.getClientRects();
		const viewportRoot =
			node.ownerDocument.documentElement ?? node.ownerDocument.body;
		const viewportRootRect = viewportRoot?.getBoundingClientRect();

		const convertViewportRectToRelativeQuad = (rect) => {
			if (relativeTo === viewportRoot) {
				return new DOMQuad(
					new DOMPoint(rect.x, rect.y),
					new DOMPoint(rect.x + rect.width, rect.y),
					new DOMPoint(rect.x + rect.width, rect.y + rect.height),
					new DOMPoint(rect.x, rect.y + rect.height),
				);
			}

			const rectInViewportRoot = new DOMRect(
				rect.x - (viewportRootRect?.x ?? 0),
				rect.y - (viewportRootRect?.y ?? 0),
				rect.width,
				rect.height,
			);
			return convertRectFromNode(relativeTo, rectInViewportRoot, viewportRoot, {
				iframes: options?.iframes,
			});
		};

		if (clientRects.length > 1) {
			if (canUseViewportTextRects) {
				const quads = [];
				for (const cr of clientRects) {
					if (cr.width < 1 && cr.height < 1) continue;
					quads.push(convertViewportRectToRelativeQuad(cr));
				}
				if (quads.length > 0) {
					if (boxQuadsCache) boxQuadsCache.set(key, quads);
					return quads;
				}
			}

			// Work via the parent element so rotation is handled correctly.
			// Each fragment's viewport rect (from getClientRects) is an AABB;
			// its center equals the actual geometric center regardless of rotation.
			// We convert that center to parent-local space, recover the fragment's
			// local dimensions via the 2x2 AABB system, then apply the parent's
			// accumulated matrix to build proper (rotated) quads in relativeTo-space.
			const parent = getParentElementIncludingSlots(node, options?.iframes);
			const M_parent = getResultingTransformationBetweenElementAndAllAncestors(
				parent,
				resolveFixedThroughViewport ? viewportRoot : relativeTo,
				options?.iframes,
			);
			const parentCss = getElementCombinedTransform(parent, options?.iframes);
			const pr = parent.getBoundingClientRect();
			const pa = parentCss.a,
				pb = parentCss.b,
				pc = parentCss.c,
				pd = parentCss.d;
			// AABB center of the transformed parent equals its geometric center.
			// geometric_center_screen = screen(0,0) + L * (pw/2, ph/2)
			// => screen(0,0) = AABB_center - L * (pw/2, ph/2)
			//@ts-ignore
			const pw = parent.offsetWidth;
			//@ts-ignore
			const ph = parent.offsetHeight;
			const parentOriginX =
				pr.x + pr.width / 2 - ((pa * pw) / 2 + (pc * ph) / 2);
			const parentOriginY =
				pr.y + pr.height / 2 - ((pb * pw) / 2 + (pd * ph) / 2);
			const linearDet = pa * pd - pb * pc;
			const absA = Math.abs(pa),
				absB = Math.abs(pb);
			const absDet = absA * absA - absB * absB;

			const quads = [];
			for (const cr of clientRects) {
				if (cr.width < 1 && cr.height < 1) continue;

				// Fragment AABB center -> parent-local center via inverse CSS transform
				const dx = cr.x + cr.width / 2 - parentOriginX;
				const dy = cr.y + cr.height / 2 - parentOriginY;
				let lcx, lcy;
				if (Math.abs(linearDet) > 1e-10) {
					lcx = (pd * dx - pc * dy) / linearDet;
					lcy = (pa * dy - pb * dx) / linearDet;
				} else {
					lcx = dx;
					lcy = dy;
				}

				// Fragment dimensions in parent-local via 2x2 AABB system
				let tw, th;
				if (Math.abs(absDet) > 1e-6) {
					tw = Math.max(0, (absA * cr.width - absB * cr.height) / absDet);
					th = Math.max(0, (absA * cr.height - absB * cr.width) / absDet);
				} else {
					// Singular (~45 deg): use CSS line-height as th
					const cs = getCachedComputedStyle(parent);
					th = Math.max(
						0,
						parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2 || 16,
					);
					const denom = Math.max(absA, absB);
					tw =
						denom > 1e-6
							? Math.max(0, (cr.width - th * absB) / denom)
							: cr.width;
				}

				// Fragment top-left in parent-local, then transform all 4 corners via M_parent
				const lx = lcx - tw / 2,
					ly = lcy - th / 2;
				const quad = new DOMQuad(
					M_parent.transformPoint(new DOMPoint(lx, ly)),
					M_parent.transformPoint(new DOMPoint(lx + tw, ly)),
					M_parent.transformPoint(new DOMPoint(lx + tw, ly + th)),
					M_parent.transformPoint(new DOMPoint(lx, ly + th)),
				);
				quads.push(
					finishQuadRelativeToTarget(
						quad,
						node,
						relativeTo,
						options?.iframes,
						resolveFixedThroughViewport,
						options?.box,
					),
				);
			}

			if (quads.length > 0) {
				if (boxQuadsCache) boxQuadsCache.set(key, quads);
				return quads;
			}
		}

		// FIX 7 (continued): Single-fragment text — reuse the already-fetched
		// bounding rect so getElementSize doesn't create a second Range.
		const textBoundingRect = range.getBoundingClientRect();
		if (canUseViewportTextRects) {
			const tQuad = [convertViewportRectToRelativeQuad(textBoundingRect)];
			if (boxQuadsCache) boxQuadsCache.set(key, tQuad);
			return tQuad;
		}
		const {width: tw, height: th} = _getTextNodeSize(
			originalElementAndAllParentsMultipliedMatrix,
			textBoundingRect,
			node,
		);
		const is2Dt = originalElementAndAllParentsMultipliedMatrix.is2D;
		const tCorners = [
			new DOMPoint(0, 0),
			new DOMPoint(tw, 0),
			new DOMPoint(tw, th),
			new DOMPoint(0, th),
		];
		/** @type {[DOMPoint,DOMPoint,DOMPoint,DOMPoint]} */
		//@ts-ignore
		const tPoints = Array(4);
		if (is2Dt) {
			for (let i = 0; i < 4; i++)
				tPoints[i] = tCorners[i].matrixTransform(
					originalElementAndAllParentsMultipliedMatrix,
				);
		} else {
			for (let i = 0; i < 4; i++) {
				tPoints[i] = projectPoint(
					tCorners[i],
					originalElementAndAllParentsMultipliedMatrix,
				).matrixTransform(originalElementAndAllParentsMultipliedMatrix);
				tPoints[i] = as2DPoint(tPoints[i]);
			}
		}
		const tQuad = [
			finishQuadRelativeToTarget(
				new DOMQuad(tPoints[0], tPoints[1], tPoints[2], tPoints[3]),
				node,
				relativeTo,
				options?.iframes,
				resolveFixedThroughViewport,
				options?.box,
			),
		];
		if (boxQuadsCache) boxQuadsCache.set(key, tQuad);
		return tQuad;
	}

	if (
		(node instanceof SVGGraphicsElement ||
			node instanceof _SVGGraphicsElement) &&
		!(node instanceof SVGSVGElement || node instanceof _SVGSVGElement)
	) {
		const bbox = node.getBBox();
		const visualBox = getSvgVisualBox(node, bbox);
		const x0 = visualBox.x - bbox.x;
		const y0 = visualBox.y - bbox.y;
		const x1 = x0 + visualBox.width;
		const y1 = y0 + visualBox.height;
		const screenPts = [
			new DOMPoint(visualBox.x, visualBox.y),
			new DOMPoint(visualBox.x + visualBox.width, visualBox.y),
			new DOMPoint(
				visualBox.x + visualBox.width,
				visualBox.y + visualBox.height,
			),
			new DOMPoint(visualBox.x, visualBox.y + visualBox.height),
		];
		const pts = [
			new DOMPoint(x0, y0),
			new DOMPoint(x1, y0),
			new DOMPoint(x1, y1),
			new DOMPoint(x0, y1),
		];
		const screenCtm = !hasTransformedHtmlAncestor(
			node,
			relativeTo,
			options?.iframes,
		)
			? node.getScreenCTM()
			: null;
		if (screenCtm) {
			const screenQuad = new DOMQuad(
				screenPts[0].matrixTransform(screenCtm),
				screenPts[1].matrixTransform(screenCtm),
				screenPts[2].matrixTransform(screenCtm),
				screenPts[3].matrixTransform(screenCtm),
			);
			const svgQuad = [
				convertViewportQuadToRelativeNode(
					screenQuad,
					node,
					relativeTo,
					options?.iframes,
				),
			];
			if (boxQuadsCache) boxQuadsCache.set(key, svgQuad);
			return svgQuad;
		}

		/** @type {[DOMPoint,DOMPoint,DOMPoint,DOMPoint]} */
		//@ts-ignore
		const points = Array(4);
		if (originalElementAndAllParentsMultipliedMatrix.is2D) {
			for (let i = 0; i < 4; i++)
				points[i] = pts[i].matrixTransform(
					originalElementAndAllParentsMultipliedMatrix,
				);
		} else {
			for (let i = 0; i < 4; i++) {
				points[i] = projectPoint(
					pts[i],
					originalElementAndAllParentsMultipliedMatrix,
				).matrixTransform(originalElementAndAllParentsMultipliedMatrix);
				points[i] = as2DPoint(points[i]);
			}
		}
		const svgQuad = [
			finishQuadRelativeToTarget(
				new DOMQuad(points[0], points[1], points[2], points[3]),
				node,
				relativeTo,
				options?.iframes,
				resolveFixedThroughViewport,
				options?.box,
			),
		];
		if (boxQuadsCache) boxQuadsCache.set(key, svgQuad);
		return svgQuad;
	}
	if (
		node instanceof win.Element &&
		relativeTo === node.ownerDocument.documentElement &&
		(!options?.box || options.box === 'border') &&
		originalElementAndAllParentsMultipliedMatrix.is2D &&
		Math.abs(originalElementAndAllParentsMultipliedMatrix.b) < 1e-10 &&
		Math.abs(originalElementAndAllParentsMultipliedMatrix.c) < 1e-10
	) {
		const rect = node.getBoundingClientRect();
		const viewportQuad = [
			new DOMQuad(
				new DOMPoint(rect.x, rect.y),
				new DOMPoint(rect.x + rect.width, rect.y),
				new DOMPoint(rect.x + rect.width, rect.y + rect.height),
				new DOMPoint(rect.x, rect.y + rect.height),
			),
		];
		if (boxQuadsCache) boxQuadsCache.set(key, viewportQuad);
		return viewportQuad;
	}

	let {width, height} = getElementSize(
		node,
		originalElementAndAllParentsMultipliedMatrix,
	);

	// FIX 13: cache cross-realm Element constructor.
	const _Element = win.Element;
	const is2D = originalElementAndAllParentsMultipliedMatrix.is2D;

	// FIX 8 + FIX 9: Split the `!o` branch out of the point loop into two
	// separate code paths. In the box-offset path, parse style values once
	// (FIX 9) and use them directly, eliminating 4x redundant parseFloat calls.
	if (node instanceof Element || node instanceof _Element) {
		const box = options?.box;
		if (box === 'margin' || box === 'padding' || box === 'content') {
			const cs = getCachedComputedStyle(node);
			let x0, y0, x1, y1, x2, y2, x3, y3;

			if (box === 'margin') {
				const mL = parseFloat(cs.marginLeft);
				const mT = parseFloat(cs.marginTop);
				const mR = parseFloat(cs.marginRight);
				const mB = parseFloat(cs.marginBottom);
				x0 = -mL;
				y0 = -mT;
				x1 = width + mR;
				y1 = -mT;
				x2 = width + mR;
				y2 = height + mB;
				x3 = -mL;
				y3 = height + mB;
			} else if (box === 'padding') {
				const bL = parseFloat(cs.borderLeftWidth);
				const bT = parseFloat(cs.borderTopWidth);
				const bR = parseFloat(cs.borderRightWidth);
				const bB = parseFloat(cs.borderBottomWidth);
				x0 = bL;
				y0 = bT;
				x1 = width - bR;
				y1 = bT;
				x2 = width - bR;
				y2 = height - bB;
				x3 = bL;
				y3 = height - bB;
			} else {
				// content
				const bL = parseFloat(cs.borderLeftWidth);
				const bT = parseFloat(cs.borderTopWidth);
				const bR = parseFloat(cs.borderRightWidth);
				const bB = parseFloat(cs.borderBottomWidth);
				const pL = parseFloat(cs.paddingLeft);
				const pT = parseFloat(cs.paddingTop);
				const pR = parseFloat(cs.paddingRight);
				const pB = parseFloat(cs.paddingBottom);
				x0 = bL + pL;
				y0 = bT + pT;
				x1 = width - bR - pR;
				y1 = bT + pT;
				x2 = width - bR - pR;
				y2 = height - bB - pB;
				x3 = bL + pL;
				y3 = height - bB - pB;
			}

			const pts = [
				new DOMPoint(x0, y0),
				new DOMPoint(x1, y1),
				new DOMPoint(x2, y2),
				new DOMPoint(x3, y3),
			];
			/** @type {[DOMPoint,DOMPoint,DOMPoint,DOMPoint]} */
			//@ts-ignore
			const points = Array(4);
			if (is2D) {
				for (let i = 0; i < 4; i++)
					points[i] = pts[i].matrixTransform(
						originalElementAndAllParentsMultipliedMatrix,
					);
			} else {
				for (let i = 0; i < 4; i++) {
					points[i] = projectPoint(
						pts[i],
						originalElementAndAllParentsMultipliedMatrix,
					).matrixTransform(originalElementAndAllParentsMultipliedMatrix);
					points[i] = as2DPoint(points[i]);
				}
			}
			const quad = [
				finishQuadRelativeToTarget(
					new DOMQuad(points[0], points[1], points[2], points[3]),
					node,
					relativeTo,
					options?.iframes,
					resolveFixedThroughViewport,
					options?.box,
				),
			];
			if (boxQuadsCache) boxQuadsCache.set(key, quad);
			return quad;
		}
	}

	// FIX 8: No-offset path — plain loop, no `!o` branch test per iteration.
	const corners = [
		new DOMPoint(0, 0),
		new DOMPoint(width, 0),
		new DOMPoint(width, height),
		new DOMPoint(0, height),
	];
	/** @type {[DOMPoint,DOMPoint,DOMPoint,DOMPoint]} */
	//@ts-ignore
	const points = Array(4);
	if (is2D) {
		for (let i = 0; i < 4; i++)
			points[i] = corners[i].matrixTransform(
				originalElementAndAllParentsMultipliedMatrix,
			);
	} else {
		for (let i = 0; i < 4; i++) {
			points[i] = projectPoint(
				corners[i],
				originalElementAndAllParentsMultipliedMatrix,
			).matrixTransform(originalElementAndAllParentsMultipliedMatrix);
			points[i] = as2DPoint(points[i]);
		}
	}

	const quad = [
		finishQuadRelativeToTarget(
			new DOMQuad(points[0], points[1], points[2], points[3]),
			node,
			relativeTo,
			options?.iframes,
			resolveFixedThroughViewport,
			options?.box,
		),
	];
	if (boxQuadsCache) boxQuadsCache.set(key, quad);
	return quad;
}

function finishQuadRelativeToTarget(
	quad,
	node,
	relativeTo,
	iframes,
	resolveFixedThroughViewport,
	box,
) {
	if (resolveFixedThroughViewport) {
		quad = alignViewportBorderQuadToRenderedBox(quad, node, box);
		return convertViewportQuadToRelativeNode(quad, node, relativeTo, iframes);
	}
	return toViewportRelativeDocumentElementQuad(quad, node, relativeTo, iframes);
}

function alignViewportBorderQuadToRenderedBox(quad, node, box) {
	if (box && box !== 'border') {
		return quad;
	}

	const win = node.ownerDocument.defaultView ?? window;
	if (!(node instanceof win.Element)) {
		return quad;
	}

	const rect = node.getBoundingClientRect();
	const left = Math.min(quad.p1.x, quad.p2.x, quad.p3.x, quad.p4.x);
	const top = Math.min(quad.p1.y, quad.p2.y, quad.p3.y, quad.p4.y);
	const dx = rect.left - left;
	const dy = rect.top - top;
	if (Math.abs(dx) < 1e-10 && Math.abs(dy) < 1e-10) {
		return quad;
	}

	const translate = (point) =>
		new DOMPoint(point.x + dx, point.y + dy, point.z, point.w);
	return new DOMQuad(
		translate(quad.p1),
		translate(quad.p2),
		translate(quad.p3),
		translate(quad.p4),
	);
}

function convertViewportQuadToRelativeNode(quad, node, relativeTo, iframes) {
	const viewportRoot =
		node.ownerDocument.documentElement ?? node.ownerDocument.body;
	if (relativeTo === viewportRoot) {
		return quad;
	}

	const win = node.ownerDocument.defaultView ?? window;
	if (relativeTo instanceof win.SVGElement) {
		const relativeScreenCtm = relativeTo.getScreenCTM();
		if (relativeScreenCtm) {
			const inverse = relativeScreenCtm.inverse();
			return new DOMQuad(
				quad.p1.matrixTransform(inverse),
				quad.p2.matrixTransform(inverse),
				quad.p3.matrixTransform(inverse),
				quad.p4.matrixTransform(inverse),
			);
		}
	}

	if (
		relativeTo.ownerDocument === node.ownerDocument &&
		relativeTo instanceof win.HTMLElement
	) {
		const htmlQuad = convertViewportQuadToHtmlElement(
			quad,
			relativeTo,
			iframes,
		);
		if (htmlQuad) {
			return htmlQuad;
		}
	}

	if (relativeTo === node.ownerDocument.body) {
		const relativeRect = relativeTo.getBoundingClientRect();
		const scrollLeft = relativeTo.scrollLeft || 0;
		const scrollTop = relativeTo.scrollTop || 0;
		return new DOMQuad(
			new DOMPoint(
				quad.p1.x - relativeRect.x + scrollLeft,
				quad.p1.y - relativeRect.y + scrollTop,
			),
			new DOMPoint(
				quad.p2.x - relativeRect.x + scrollLeft,
				quad.p2.y - relativeRect.y + scrollTop,
			),
			new DOMPoint(
				quad.p3.x - relativeRect.x + scrollLeft,
				quad.p3.y - relativeRect.y + scrollTop,
			),
			new DOMPoint(
				quad.p4.x - relativeRect.x + scrollLeft,
				quad.p4.y - relativeRect.y + scrollTop,
			),
		);
	}

	return convertQuadFromNode(relativeTo, quad, viewportRoot, {iframes});
}

function convertViewportQuadToHtmlElement(quad, relativeTo, iframes) {
	const scale = getPositiveAxisAlignedViewportScale(relativeTo, iframes);
	if (!scale) {
		return null;
	}

	const relativeRect = relativeTo.getBoundingClientRect();
	const scaleX = scale.x;
	const scaleY = scale.y;
	if (
		!Number.isFinite(scaleX) ||
		!Number.isFinite(scaleY) ||
		Math.abs(scaleX) < 1e-10 ||
		Math.abs(scaleY) < 1e-10
	) {
		return null;
	}

	const scrollLeft = relativeTo.scrollLeft || 0;
	const scrollTop = relativeTo.scrollTop || 0;
	const convertPoint = (point) =>
		new DOMPoint(
			(point.x - relativeRect.x) / scaleX + scrollLeft,
			(point.y - relativeRect.y) / scaleY + scrollTop,
		);

	return new DOMQuad(
		convertPoint(quad.p1),
		convertPoint(quad.p2),
		convertPoint(quad.p3),
		convertPoint(quad.p4),
	);
}

function getPositiveAxisAlignedViewportScale(element, iframes) {
	const win = element.ownerDocument.defaultView ?? window;
	const scale = {x: 1, y: 1};
	let current = element;
	while (current && current !== element.ownerDocument.documentElement) {
		if (current instanceof win.Element) {
			const style = getCachedComputedStyle(current);
			const transformScale = getPositiveAxisAlignedTransformScale(style);
			if (!transformScale) {
				return null;
			}
			const zoom = getElementZoom(current);
			scale.x *= transformScale.x * zoom;
			scale.y *= transformScale.y * zoom;
		}
		current = getParentElementIncludingSlots(current, iframes);
	}
	return scale;
}

function getPositiveAxisAlignedTransformScale(style) {
	if (style.perspective && style.perspective !== 'none') {
		return null;
	}
	if (
		style.rotate &&
		style.rotate !== 'none' &&
		!isZeroAngleValue(style.rotate)
	) {
		return null;
	}
	const individualScale = parsePositiveScaleValue(style.scale);
	if (!individualScale) {
		return null;
	}

	const transform = style.transform;
	if (!transform || transform === 'none') {
		return individualScale;
	}

	if (transform.startsWith('matrix3d(')) {
		const values = parseCssMatrixValues(transform);
		if (
			values?.length === 16 &&
			values[0] > 0 &&
			values[5] > 0 &&
			Math.abs(values[1]) < 1e-10 &&
			Math.abs(values[4]) < 1e-10 &&
			Math.abs(values[3]) < 1e-10 &&
			Math.abs(values[7]) < 1e-10 &&
			Math.abs(values[11]) < 1e-10
		) {
			return {
				x: individualScale.x * values[0],
				y: individualScale.y * values[5],
			};
		}
		return null;
	}

	if (transform.startsWith('matrix(')) {
		const values = parseCssMatrixValues(transform);
		if (
			values?.length === 6 &&
			values[0] > 0 &&
			values[3] > 0 &&
			Math.abs(values[1]) < 1e-10 &&
			Math.abs(values[2]) < 1e-10
		) {
			return {
				x: individualScale.x * values[0],
				y: individualScale.y * values[3],
			};
		}
		return null;
	}

	return null;
}

function parsePositiveScaleValue(value) {
	if (!value || value === 'none') {
		return {x: 1, y: 1};
	}
	const parts = value
		.split(/\s+/)
		.map((part) => parseFloat(part))
		.filter(Number.isFinite);
	if (
		parts.length === 0 ||
		parts[0] <= 0 ||
		(parts[1] != null && parts[1] <= 0)
	) {
		return null;
	}
	return {x: parts[0], y: parts[1] ?? parts[0]};
}

function parseCssMatrixValues(transform) {
	const start = transform.indexOf('(');
	const end = transform.lastIndexOf(')');
	if (start < 0 || end <= start) {
		return null;
	}
	const values = transform
		.slice(start + 1, end)
		.split(',')
		.map((value) => parseFloat(value.trim()));
	return values.every(Number.isFinite) ? values : null;
}

function isZeroAngleValue(value) {
	const matches = value.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
	if (!matches?.length) {
		return false;
	}
	const angle = parseFloat(matches[matches.length - 1]);
	return Number.isFinite(angle) && Math.abs(angle) < 1e-10;
}

function hasTransformedHtmlAncestor(node, relativeTo, iframes) {
	const win = node.ownerDocument.defaultView ?? window;
	let element = getParentElementIncludingSlots(node, iframes);
	while (
		element &&
		element !== relativeTo &&
		element !== node.ownerDocument.documentElement
	) {
		if (element instanceof win.HTMLElement) {
			const css = getCachedComputedStyle(element);
			if (
				transformProperties.some((value) =>
					css[value] ? css[value] !== 'none' : false,
				)
			) {
				return true;
			}
		}
		element = getParentElementIncludingSlots(element, iframes);
	}
	return false;
}

function toViewportRelativeDocumentElementQuad(
	quad,
	node,
	relativeTo,
	iframes,
) {
	if (relativeTo !== node.ownerDocument.documentElement) {
		return quad;
	}
	if (isViewportFixedAnchoredNode(node, iframes)) {
		return quad;
	}

	const win = node.ownerDocument.defaultView ?? window;
	const scrollX =
		win.scrollX ?? node.ownerDocument.documentElement.scrollLeft ?? 0;
	const scrollY =
		win.scrollY ?? node.ownerDocument.documentElement.scrollTop ?? 0;
	if (scrollX === 0 && scrollY === 0) {
		return quad;
	}

	return new DOMQuad(
		new DOMPoint(quad.p1.x - scrollX, quad.p1.y - scrollY),
		new DOMPoint(quad.p2.x - scrollX, quad.p2.y - scrollY),
		new DOMPoint(quad.p3.x - scrollX, quad.p3.y - scrollY),
		new DOMPoint(quad.p4.x - scrollX, quad.p4.y - scrollY),
	);
}

function isViewportFixedAnchoredNode(node, iframes) {
	const win = node.ownerDocument.defaultView ?? window;
	let element = null;
	if (node instanceof win.Text) {
		element = getParentElementIncludingSlots(node, iframes);
	} else if (node instanceof win.Element) {
		element = node;
	}

	while (element && element !== node.ownerDocument.documentElement) {
		const cs = getCachedComputedStyle(element);
		if (cs.position === 'fixed') {
			return getNearestFixedContainingBlock(element, iframes) == null;
		}
		element = getParentElementIncludingSlots(element, iframes);
	}

	return false;
}

function shouldResolveFixedPositionThroughViewport(node, relativeTo, iframes) {
	const win = node.ownerDocument.defaultView ?? window;
	let element = null;
	if (node instanceof win.Text) {
		element = getParentElementIncludingSlots(node, iframes);
	} else if (node instanceof win.Element) {
		element = node;
	}

	while (element && element !== node.ownerDocument.documentElement) {
		const cs = getCachedComputedStyle(element);
		if (cs.position === 'fixed') {
			const fixedContainer = getNearestFixedContainingBlock(element, iframes);
			return (
				fixedContainer == null ||
				(fixedContainer !== relativeTo &&
					!isFlatTreeInclusiveAncestor(relativeTo, fixedContainer))
			);
		}
		if (element === relativeTo) {
			break;
		}
		element = getParentElementIncludingSlots(element, iframes);
	}

	return false;
}
/**
 * Compute width/height for a Text node given an already-fetched bounding rect.
 * Extracted from getElementSize so getBoxQuads (FIX 7) can reuse the Range it
 * already created, avoiding a second Range allocation.
 * @param {DOMMatrix} matrix
 * @param {DOMRect} targetRect
 * @param {Text} node
 */
function _getTextNodeSize(matrix, targetRect, node) {
	const absA = Math.abs(matrix?.a ?? 1);
	const absB = Math.abs(matrix?.b ?? 0);
	const det = absA * absA - absB * absB; // cos(2*angle)*scale^2
	let width, height;
	if (Math.abs(det) > 1e-6) {
		width = Math.max(
			0,
			(absA * targetRect.width - absB * targetRect.height) / det,
		);
		height = Math.max(
			0,
			(absA * targetRect.height - absB * targetRect.width) / det,
		);
	} else {
		// Singular (~45 deg rotation): use CSS line-height as the known height
		const parentEl = node.parentElement;
		let lineH = 16;
		if (parentEl) {
			const cs = getCachedComputedStyle(parentEl);
			lineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2 || 16;
		}
		height = Math.max(0, lineH);
		const denom = Math.max(absA, absB);
		width =
			denom > 1e-6
				? Math.max(0, (targetRect.width - height * absB) / denom)
				: targetRect.width;
	}
	return {width, height};
}

//todo: https://drafts.csswg.org/css-transforms-2/#accumulated-3d-transformation-matrix-computation
// also good for writing a spec

// Find a value for z that will transform to 0. (from firefox matrix.h)
// or chromium https://github.com/chromium/chromium/blob/main/ui/gfx/geometry/transform.cc#L849
/**
 * @param {DOMPoint} point
 */
function projectPoint(point, m) {
	const z = -(point.x * m.m13 + point.y * m.m23 + m.m43) / m.m33;
	return new DOMPoint(point.x, point.y, z, 1);
}
/**
 * convert a DOM-Point to 2D
 * @param {DOMPoint} point
 */
function as2DPoint(point) {
	return new DOMPoint(point.x / point.w, point.y / point.w);
}
/**
 * @param {Node} node
 * @param {DOMMatrix=} matrix
 */
export function getElementSize(node, matrix) {
	let width = 0;
	let height = 0;
	// FIX 13: Cache cross-realm constructors once.
	const win = node.ownerDocument.defaultView ?? window;
	if (node instanceof HTMLElement || node instanceof win.HTMLElement) {
		width = node.offsetWidth;
		height = node.offsetHeight;
	} else if (
		node instanceof SVGSVGElement ||
		node instanceof win.SVGSVGElement
	) {
		width = node.width.baseVal.value;
		height = node.height.baseVal.value;
	} else if (
		node instanceof SVGGraphicsElement ||
		node instanceof win.SVGGraphicsElement
	) {
		const bbox = node.getBBox();
		width = bbox.width;
		height = bbox.height;
	} else if (
		node instanceof MathMLElement ||
		node instanceof win.MathMLElement
	) {
		const bbox = node.getBoundingClientRect();
		width = bbox.width / (matrix?.a ?? 1);
		height = bbox.height / (matrix?.d ?? 1);
	} else if (node instanceof Text || node instanceof win.Text) {
		// Note: getBoxQuads passes an already-fetched rect via _getTextNodeSize to
		// avoid this Range creation. This path serves external callers of getElementSize.
		const range = node.ownerDocument.createRange();
		range.selectNodeContents(node);
		const targetRect = range.getBoundingClientRect();
		const result = _getTextNodeSize(matrix, targetRect, node);
		width = result.width;
		height = result.height;
	}
	return {width, height};
}

function getSvgVisualBox(node, bbox) {
	const svgStyle = getCachedComputedStyle(node);
	const strokeWidth =
		svgStyle.stroke !== 'none' ? parseFloat(svgStyle.strokeWidth) || 0 : 0;
	if (strokeWidth <= 0) {
		return bbox;
	}

	const strokeInflation = getSvgStrokeInflation(node, bbox, strokeWidth);
	return new DOMRect(
		bbox.x - strokeInflation.left,
		bbox.y - strokeInflation.top,
		bbox.width + strokeInflation.left + strokeInflation.right,
		bbox.height + strokeInflation.top + strokeInflation.bottom,
	);
}

function getSvgStrokeInflation(node, bbox, strokeWidth) {
	const halfStrokeWidth = strokeWidth / 2;
	if (
		node instanceof SVGLineElement ||
		node instanceof (node.ownerDocument.defaultView ?? window).SVGLineElement
	) {
		const x1 = node.x1.baseVal.value;
		const y1 = node.y1.baseVal.value;
		const x2 = node.x2.baseVal.value;
		const y2 = node.y2.baseVal.value;
		const dx = x2 - x1;
		const dy = y2 - y1;
		const length = Math.hypot(dx, dy);

		if (length > 1e-10) {
			let inflateX = (halfStrokeWidth * Math.abs(dy)) / length;
			let inflateY = (halfStrokeWidth * Math.abs(dx)) / length;
			const lineCap = getCachedComputedStyle(node).strokeLinecap;

			if (lineCap === 'round' || lineCap === 'square') {
				inflateX += (halfStrokeWidth * Math.abs(dx)) / length;
				inflateY += (halfStrokeWidth * Math.abs(dy)) / length;
			}

			return {left: inflateX, right: inflateX, top: inflateY, bottom: inflateY};
		}
	}

	const genericInflation = strokeWidth * 2;
	return {
		left: genericInflation,
		right: genericInflation,
		top: genericInflation,
		bottom: genericInflation,
	};
}
/**
 * @param {Node} node
 * @param {boolean} includeScroll
 * @param {HTMLIFrameElement[]} iframes
 */
function getElementOffsetsInContainer(node, includeScroll, iframes) {
	if (
		node instanceof HTMLElement ||
		node instanceof (node.ownerDocument.defaultView ?? window).HTMLElement
	) {
		// When <html> appears inside a shadow DOM canvas the browser reflects
		// body's top margin into html.offsetTop (but not offsetLeft), causing
		// a Y-only shift in the transform walk.  The html element has no real
		// layout offset relative to its shadow-host container, so return 0,0.
		if (
			node instanceof HTMLHtmlElement ||
			node instanceof (node.ownerDocument.defaultView ?? window).HTMLHtmlElement
		) {
			return new DOMPoint(0, 0);
		}
		const cs = getCachedComputedStyle(node);
		if (cs.position === 'fixed') {
			const fixedContainer = getNearestFixedContainingBlock(node, iframes);
			if (!fixedContainer) {
				const left =
					cs.left && cs.left !== 'auto' ? parseFloat(cs.left) : node.offsetLeft;
				const top =
					cs.top && cs.top !== 'auto' ? parseFloat(cs.top) : node.offsetTop;
				return new DOMPoint(left, top);
			}

			const m = getResultingTransformationBetweenElementAndAllAncestors(
				fixedContainer,
				node.ownerDocument.body,
				iframes,
				true,
			).inverse();
			const r1 = node.getBoundingClientRect();
			const r1t = m.transformPoint(r1);
			const r2 = fixedContainer.getBoundingClientRect();
			const r2t = m.transformPoint(r2);

			return new DOMPoint(r1t.x - r2t.x, r1t.y - r2t.y);
		}

		// FIX 4: Only call getCachedComputedStyle when includeScroll is true —
		//        cs is unused in the plain offsetLeft/offsetTop path.
		if (includeScroll) {
			return new DOMPoint(
				node.offsetLeft - (node.scrollLeft - parseFloat(cs.borderLeftWidth)),
				node.offsetTop - (node.scrollTop - parseFloat(cs.borderTopWidth)),
			);
		} else {
			return new DOMPoint(node.offsetLeft, node.offsetTop);
		}
	} else if (
		node instanceof Text ||
		node instanceof (node.ownerDocument.defaultView ?? window).Text
	) {
		const range = node.ownerDocument.createRange();
		range.selectNodeContents(node);
		const r1 = range.getBoundingClientRect();
		/** @type {HTMLElement} */
		//@ts-ignore
		const parent = getParentElementIncludingSlots(node, iframes);
		const r2 = parent.getBoundingClientRect();

		// Get the parent's CSS transform so we can work in local space even when rotated.
		const pt = getElementCombinedTransform(parent, iframes);
		const pa = pt.a,
			pb = pt.b,
			pc = pt.c,
			pd = pt.d;

		// AABB center of the transformed parent equals its geometric center.
		// geometric_center_screen = screen(0,0) + L * (pw/2, ph/2)
		// => screen(0,0) = AABB_center - L * (pw/2, ph/2)
		const pw = parent.offsetWidth;
		const ph = parent.offsetHeight;
		const parentOriginX = r2.x + r2.width / 2 - ((pa * pw) / 2 + (pc * ph) / 2);
		const parentOriginY =
			r2.y + r2.height / 2 - ((pb * pw) / 2 + (pd * ph) / 2);

		// Delta from parent origin to text AABB center in screen space
		const dx = r1.x + r1.width / 2 - parentOriginX;
		const dy = r1.y + r1.height / 2 - parentOriginY;

		// Apply inverse of CSS transform linear part: local_center = L^-1 * screen_delta
		const transformDet = pa * pd - pb * pc;
		let localCenterX, localCenterY;
		if (Math.abs(transformDet) > 1e-10) {
			localCenterX = (pd * dx - pc * dy) / transformDet;
			localCenterY = (pa * dy - pb * dx) / transformDet;
		} else {
			localCenterX = dx;
			localCenterY = dy;
		}

		// Recover tw and th in local space from the AABB using the 2x2 system:
		//   aabb_w = tw*|cos| + th*|sin|,  aabb_h = tw*|sin| + th*|cos|
		const absA = Math.abs(pa),
			absB = Math.abs(pb);
		const absDet = absA * absA - absB * absB;
		let tw, th;
		if (Math.abs(absDet) > 1e-6) {
			tw = Math.max(0, (absA * r1.width - absB * r1.height) / absDet);
			th = Math.max(0, (absA * r1.height - absB * r1.width) / absDet);
		} else {
			// Singular (~45 deg): use CSS line-height as th
			const cs = getCachedComputedStyle(parent);
			th = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2 || 16;
			th = Math.max(0, th);
			const denom = Math.max(absA, absB);
			tw =
				denom > 1e-6 ? Math.max(0, (r1.width - th * absB) / denom) : r1.width;
		}

		// local origin = center minus half-dimensions
		return new DOMPoint(localCenterX - tw / 2, localCenterY - th / 2);
	} else if (
		node instanceof Element ||
		node instanceof (node.ownerDocument.defaultView ?? window).Element
	) {
		if (
			(node instanceof SVGGraphicsElement ||
				node instanceof
					(node.ownerDocument.defaultView ?? window).SVGGraphicsElement) &&
			!(
				node instanceof SVGSVGElement ||
				node instanceof (node.ownerDocument.defaultView ?? window).SVGSVGElement
			)
		) {
			const bb = node.getBBox();
			return new DOMPoint(bb.x, bb.y);
		}
		const cs = getCachedComputedStyle(node);
		if (cs.position === 'absolute') {
			return new DOMPoint(parseFloat(cs.left), parseFloat(cs.top));
		}

		const par = getParentElementIncludingSlots(node, iframes);
		const m = getResultingTransformationBetweenElementAndAllAncestors(
			par,
			document.body,
			iframes,
			true,
		).inverse();
		const r1 = node.getBoundingClientRect();
		const r1t = m.transformPoint(r1);
		const r2 = par.getBoundingClientRect();
		const r2t = m.transformPoint(r2);

		return new DOMPoint(r1t.x - r2t.x, r1t.y - r2t.y);
	}
}
/**
 * @param {Node} node
 * @param {Element} ancestor
 * @param {HTMLIFrameElement[]} iframes
 * @param {boolean=} excludeSelfZoom
 */
export function getResultingTransformationBetweenElementAndAllAncestors(
	node,
	ancestor,
	iframes,
	excludeSelfZoom = false,
) {
	let key;
	if (transformCache) {
		let i1 = hash.get(node);
		if (i1 === undefined) hash.set(node, (i1 = hashId++));
		let i2 = hash.get(ancestor);
		if (i2 === undefined) hash.set(ancestor, (i2 = hashId++));
		key = i1 + '_' + i2 + '_' + (excludeSelfZoom ? 'no-self-zoom' : 'full');
		const q = transformCache.get(key);
		if (q) return q;
	}

	/** @type {Element } */
	//@ts-ignore
	let actualElement = node;
	/** @type {DOMMatrix } */
	let parentElementMatrix;

	// FIX 12: Compute self-transform once; we'll carry parent transforms forward
	//         each iteration instead of recomputing them.
	const useOwnSvgCtm =
		(actualElement instanceof SVGGraphicsElement ||
			actualElement instanceof
				(actualElement.ownerDocument.defaultView ?? window)
					.SVGGraphicsElement) &&
		!(
			actualElement instanceof SVGSVGElement ||
			actualElement instanceof
				(actualElement.ownerDocument.defaultView ?? window).SVGSVGElement
		);
	// SVGGraphicsElement.getCTM() already includes the element's local SVG/CSS transform.
	// Starting with getElementTransformWithZoom here would double-apply self rotate/scale.
	let currentElementTransform = useOwnSvgCtm
		? new DOMMatrix()
		: getElementTransformWithZoom(actualElement, iframes, !excludeSelfZoom);

	/** @type {DOMMatrix } */
	// FIX 2: Only use a non-identity starting matrix when the element itself has
	//        a CSS transform. Most plain elements have identity, avoiding a multiply.
	let originalElementAndAllParentsMultipliedMatrix =
		currentElementTransform.isIdentity
			? new DOMMatrix()
			: currentElementTransform;

	let perspectiveParentElement = getParentElementIncludingSlots(
		actualElement,
		iframes,
	);
	if (perspectiveParentElement) {
		// FIX 5: Guard transformStyle read behind is2D — on a standard 2D page
		//        the matrix is always 2D here so we skip the style read entirely.
		if (!originalElementAndAllParentsMultipliedMatrix.is2D) {
			const s = getCachedComputedStyle(perspectiveParentElement);
			if (s.transformStyle !== 'preserve-3d') {
				projectTo2D(originalElementAndAllParentsMultipliedMatrix);
			}
		}
	}

	let lastOffsetParent = null;
	while (actualElement != ancestor && actualElement != null) {
		let parentElement = getParentElementIncludingSlots(actualElement, iframes);

		if (
			actualElement instanceof HTMLElement ||
			actualElement instanceof
				(actualElement.ownerDocument.defaultView ?? window).HTMLElement
		) {
			const fixedStyle = getCachedComputedStyle(actualElement);
			if (fixedStyle.position === 'fixed') {
				const fixedContainer = getNearestFixedContainingBlock(
					actualElement,
					iframes,
				);
				parentElement = fixedContainer ?? ancestor;
			}
		}

		if (actualElement.assignedSlot != null) {
			if (actualElement.nodeType === Node.ELEMENT_NODE) {
				const slotOffsetParent = offsetParentPolyfill(actualElement);
				const shouldApplySlottedOffset =
					lastOffsetParent !== slotOffsetParent &&
					(lastOffsetParent === null ||
						actualElement === lastOffsetParent ||
						!isFlatTreeInclusiveAncestor(lastOffsetParent, actualElement));
				if (shouldApplySlottedOffset) {
					const l = offsetTopLeftPolyfill(actualElement, 'offsetLeft');
					const t = offsetTopLeftPolyfill(actualElement, 'offsetTop');
					// FIX 3: Skip zero-translation matrix allocations.
					if (l !== 0 || t !== 0) {
						const mvMat = new DOMMatrix().translateSelf(l, t);
						originalElementAndAllParentsMultipliedMatrix = mvMat.multiplySelf(
							originalElementAndAllParentsMultipliedMatrix,
						);
					}
					lastOffsetParent = slotOffsetParent;
				}
				if (lastOffsetParent === null) lastOffsetParent = slotOffsetParent;
			} else if (actualElement.nodeType === Node.TEXT_NODE) {
				const offsets = getElementOffsetsInContainer(
					actualElement,
					actualElement !== node,
					iframes,
				);
				// FIX 3
				if (offsets.x !== 0 || offsets.y !== 0) {
					const mvMat = new DOMMatrix().translateSelf(offsets.x, offsets.y);
					originalElementAndAllParentsMultipliedMatrix = mvMat.multiplySelf(
						originalElementAndAllParentsMultipliedMatrix,
					);
				}
			}
			/*
            following code should be used instead of above to fix:
            but it does not work with:
                <div>
                    <visu-tag-root-canvas id="outer-tag-root-canvas" tag-root="SRM.RBG01">
                        <template shadowrootmode="open">
                            <div id="rootObj" style="height:100%;width:100%;position:absolute;top:400px;">
                                <slot></slot>
                            </div>
                        </template>
                        <div class="wrapper" id="aaaaabb" style="height:50px;width:50px;"></div>
                    </visu-tag-root-canvas>
                </div>
            */
			/*
            const l = offsetTopLeftPolyfill(actualElement, 'offsetLeft');
            const t = offsetTopLeftPolyfill(actualElement, 'offsetTop');
            const mvMat = new DOMMatrix().translateSelf(l, t);
            originalElementAndAllParentsMultipliedMatrix = mvMat.multiplySelf(originalElementAndAllParentsMultipliedMatrix);
            */
		} else {
			if (
				!(actualElement instanceof SVGSVGElement) &&
				!(
					actualElement instanceof
					(actualElement.ownerDocument.defaultView ?? window).SVGSVGElement
				) &&
				(actualElement instanceof SVGGraphicsElement ||
					actualElement instanceof
						(actualElement.ownerDocument.defaultView ?? window)
							.SVGGraphicsElement)
			) {
				const ctm = actualElement.getCTM();
				const bb = actualElement.getBBox();
				// FIX 3
				if (bb.x !== 0 || bb.y !== 0) {
					const mvMat = new DOMMatrix().translateSelf(bb.x, bb.y);
					originalElementAndAllParentsMultipliedMatrix = mvMat.multiplySelf(
						originalElementAndAllParentsMultipliedMatrix,
					);
				}
				originalElementAndAllParentsMultipliedMatrix = new DOMMatrix([
					ctm.a,
					ctm.b,
					ctm.c,
					ctm.d,
					ctm.e,
					ctm.f,
				]).multiplySelf(originalElementAndAllParentsMultipliedMatrix);
				parentElement = actualElement.ownerSVGElement;
			} else if (
				actualElement instanceof HTMLElement ||
				actualElement instanceof
					(actualElement.ownerDocument.defaultView ?? window).HTMLElement
			) {
				const actualStyle = getCachedComputedStyle(actualElement);
				const isFixedSelf =
					actualStyle.position === 'fixed' && actualElement === node;
				if (
					(isFixedSelf || lastOffsetParent !== actualElement.offsetParent) &&
					!(
						actualElement instanceof HTMLSlotElement ||
						actualElement instanceof
							(actualElement.ownerDocument.defaultView ?? window)
								.HTMLSlotElement
					) &&
					(lastOffsetParent === null ||
						actualElement === lastOffsetParent ||
						!isFlatTreeInclusiveAncestor(lastOffsetParent, actualElement))
				) {
					const offsets = getElementOffsetsInContainer(
						actualElement,
						actualElement !== node,
						iframes,
					);
					const zoom = getElementZoom(actualElement);
					lastOffsetParent = actualElement.offsetParent;
					// FIX 3
					if (offsets.x !== 0 || offsets.y !== 0) {
						const mvMat = new DOMMatrix().translateSelf(
							offsets.x * zoom,
							offsets.y * zoom,
						);
						originalElementAndAllParentsMultipliedMatrix = mvMat.multiplySelf(
							originalElementAndAllParentsMultipliedMatrix,
						);
					}
				}
			} else {
				const offsets = getElementOffsetsInContainer(
					actualElement,
					actualElement !== node,
					iframes,
				);
				lastOffsetParent = null;
				// FIX 3
				if (offsets.x !== 0 || offsets.y !== 0) {
					const mvMat = new DOMMatrix().translateSelf(offsets.x, offsets.y);
					originalElementAndAllParentsMultipliedMatrix = mvMat.multiplySelf(
						originalElementAndAllParentsMultipliedMatrix,
					);
				}
			}
		}

		if (parentElement) {
			if (parentElement === ancestor) {
				// The ancestor's own transform is excluded from the returned matrix,
				// so avoid computing it on the hot return path.
				if (
					lastOffsetParent !== null &&
					(parentElement instanceof HTMLElement ||
						parentElement instanceof
							(parentElement.ownerDocument.defaultView ?? window)
								.HTMLElement) &&
					parentElement.offsetParent === lastOffsetParent
				) {
					const ancOff = getElementOffsetsInContainer(
						parentElement,
						false,
						iframes,
					);
					// FIX 3
					if (ancOff.x !== 0 || ancOff.y !== 0) {
						originalElementAndAllParentsMultipliedMatrix = new DOMMatrix()
							.translate(-ancOff.x, -ancOff.y)
							.multiply(originalElementAndAllParentsMultipliedMatrix);
					}
				}
				// FIX 15: Do NOT subtract the scroll of documentElement (the viewport/window
				//         scroll). The offsetLeft/offsetTop walk already yields document-absolute
				//         coordinates; subtracting documentElement.scrollTop would wrongly
				//         shift positions to viewport-space when the page is scrolled.
				//         Only subtract scroll for a non-root ancestor that is itself a
				//         scroll container (e.g. an overflow:scroll div used as relativeTo).
				const isViewportScrollContainer =
					parentElement === parentElement.ownerDocument.documentElement;
				if (
					!isViewportScrollContainer &&
					(parentElement.scrollTop || parentElement.scrollLeft)
				)
					originalElementAndAllParentsMultipliedMatrix = new DOMMatrix()
						.translate(-parentElement.scrollLeft, -parentElement.scrollTop)
						.multiply(originalElementAndAllParentsMultipliedMatrix);

				const ancestorZoom = getElementZoomScaleTransform(parentElement);
				if (!ancestorZoom.isIdentity)
					originalElementAndAllParentsMultipliedMatrix = ancestorZoom.multiply(
						originalElementAndAllParentsMultipliedMatrix,
					);

				// FIX 6: Cache result on the early-return path. Originally, the
				//        cache.set() only ran after the while-loop (the null/root
				//        fallthrough), so the most common case — element IS a
				//        descendant of ancestor — was NEVER cached.
				if (transformCache)
					transformCache.set(key, originalElementAndAllParentsMultipliedMatrix);

				return originalElementAndAllParentsMultipliedMatrix;
			}

			// FIX 12: parentElementMatrix computed here; in the next iteration this
			//         becomes the element's own transform, so we can reuse it without
			//         calling getElementCombinedTransform again.
			parentElementMatrix = getElementTransformWithZoom(parentElement, iframes);

			if (!parentElementMatrix.isIdentity)
				originalElementAndAllParentsMultipliedMatrix =
					parentElementMatrix.multiply(
						originalElementAndAllParentsMultipliedMatrix,
					);

			perspectiveParentElement = getParentElementIncludingSlots(
				parentElement,
				iframes,
			);
			if (perspectiveParentElement) {
				// FIX 5: Skip transformStyle read when matrix is already 2D.
				if (!originalElementAndAllParentsMultipliedMatrix.is2D) {
					const s = getCachedComputedStyle(perspectiveParentElement);
					if (s.transformStyle !== 'preserve-3d') {
						projectTo2D(originalElementAndAllParentsMultipliedMatrix);
					}
				}
			}
		}
		actualElement = parentElement;
	}

	if (transformCache) {
		transformCache.set(key, originalElementAndAllParentsMultipliedMatrix);
	}
	return originalElementAndAllParentsMultipliedMatrix;
}

/*
getResultingTransformationBetweenElementAndAllAncestors -> but with extra layout matrix (does not work yet....)

export function getResultingTransformationBetweenElementAndAllAncestors(node, ancestor, iframes) {
    let key;
    if (transformCache) {
        let i1 = hash.get(node);
        if (i1 === undefined)
            hash.set(node, i1 = hashId++);
        let i2 = hash.get(ancestor);
        if (i2 === undefined)
            hash.set(ancestor, i2 = hashId++);
        key = i1 + '_' + i2;
        const q = transformCache.get(key);
        if (q)
            return q;
    }

    // NEW - two matrices instead of one
    let layoutMatrix = new DOMMatrix();

    let actualElement = node;

    let transformMatrix = getElementCombinedTransform(actualElement, iframes); //.multiplySelf(transformMatrix);


    const perspectiveParent = getParentElementIncludingSlots(actualElement, iframes);
    if (perspectiveParent) {
        const s = getCachedComputedStyle(perspectiveParent);
        if (s.transformStyle !== "preserve-3d")
            projectTo2D(transformMatrix);
    }


    let lastOffsetParent = null;

    while (actualElement !== ancestor && actualElement != null) {

        const parentElement = getParentElementIncludingSlots(actualElement, iframes);

        // ------------------------
        //  LAYOUT MATRIX (offsets)
        // ------------------------

        if (actualElement.assignedSlot != null) {

            const l = offsetTopLeftPolyfill(actualElement, "offsetLeft");
            const t = offsetTopLeftPolyfill(actualElement, "offsetTop");
            layoutMatrix = new DOMMatrix().translateSelf(l, t).multiplySelf(layoutMatrix);

        } else {

            if (actualElement instanceof HTMLElement ||
                actualElement instanceof (actualElement.ownerDocument.defaultView ?? window).HTMLElement) {

                if (lastOffsetParent !== actualElement.offsetParent &&
                    !(actualElement instanceof HTMLSlotElement)) {

                    const offsets = getElementOffsetsInContainer(actualElement, actualElement !== node, iframes);
                    lastOffsetParent = actualElement.offsetParent;

                    layoutMatrix = new DOMMatrix().translateSelf(offsets.x, offsets.y).multiplySelf(layoutMatrix);
                }

            } else {

                const offsets = getElementOffsetsInContainer(actualElement, actualElement !== node, iframes);
                lastOffsetParent = null;

                layoutMatrix = new DOMMatrix().translateSelf(offsets.x, offsets.y).multiplySelf(layoutMatrix);
            }
        }

        // ------------------------
        //  TRANSFORM MATRIX (CSS)
        // ------------------------

        if (parentElement) {

            // NEW - only affects transform pipeline
            const parentTransform = getElementCombinedTransform(parentElement, iframes);
            transformMatrix = parentTransform.multiply(transformMatrix);

            // flattening boundary
            const perspectiveParent = getParentElementIncludingSlots(parentElement, iframes);
            if (perspectiveParent) {
                const s = getCachedComputedStyle(perspectiveParent);
                if (s.transformStyle !== "preserve-3d")
                    projectTo2D(transformMatrix);
            }

            // ------------------------
            //  EXIT CONDITION
            // ------------------------

            if (parentElement === ancestor) {

                // NEW - scroll offsets belong to layout
                if (parentElement.scrollTop || parentElement.scrollLeft) {
                    layoutMatrix = new DOMMatrix()
                        .translate(-parentElement.scrollLeft, -parentElement.scrollTop)
                        .multiply(layoutMatrix);
                }

                const result = layoutMatrix.multiply(transformMatrix);

                if (transformCache)
                    transformCache.set(key, result);

                return result;
            }
        }

        actualElement = parentElement;
    }

    const result = layoutMatrix.multiply(transformMatrix);

    if (transformCache)
        transformCache.set(key, result);

    return result;
}
*/

/**
 * @param {Node} node
 * @param {HTMLIFrameElement[]} iframes
 * @returns {Element}
 */
function getParentElementIncludingSlots(node, iframes) {
	if (
		(node instanceof Element ||
			node instanceof (node.ownerDocument.defaultView ?? window).Element) &&
		node.assignedSlot
	)
		return node.assignedSlot;
	if (node.parentElement == null) {
		if (
			node.parentNode instanceof ShadowRoot ||
			node.parentNode instanceof
				(node.ownerDocument.defaultView ?? window).ShadowRoot
		) {
			return node.parentNode.host;
		}
	}
	if (
		node instanceof HTMLHtmlElement ||
		node instanceof (node.ownerDocument.defaultView ?? window).HTMLHtmlElement
	) {
		if (iframes) {
			for (const f of iframes)
				if (f?.contentDocument == node.ownerDocument) return f;
		}
	}
	return node.parentElement;
}
/**
 * @param {Node} element
 * @param {HTMLIFrameElement[]=} iframes
 */
export function getElementCombinedTransform(element, iframes) {
	if (
		element instanceof Text ||
		element instanceof (element.ownerDocument.defaultView ?? window).Text
	)
		return new DOMMatrix();

	/** @type {Element} */
	// @ts-ignore
	const actualElement = element;

	//https://www.w3.org/TR/css-transforms-2/#ctm
	let s = getCachedComputedStyle(actualElement);

	// FIX 10: Check hasTransform first — it's the most common non-identity case.
	//         Reordering so the most frequent hit is evaluated first.
	const hasTransform = s.transform !== 'none' && !!s.transform;
	const hasTranslate = s.translate !== 'none' && !!s.translate;
	const hasRotate = s.rotate !== 'none' && !!s.rotate;
	const hasScale = s.scale !== 'none' && !!s.scale;
	const hasOffsetPath = !!s.offsetPath && s.offsetPath !== 'none';

	if (
		!hasTransform &&
		!hasTranslate &&
		!hasRotate &&
		!hasScale &&
		!hasOffsetPath
	) {
		// FIX 1: Check parent perspective right here in the fast-path, so identity
		//        elements on non-3D pages return a new DOMMatrix() immediately
		//        without calling getElementPerspectiveTransform at all.
		const parent = getParentElementIncludingSlots(actualElement, iframes);
		if (!parent) return new DOMMatrix();
		const ps = getCachedComputedStyle(parent);
		if (!ps.perspective || ps.perspective === 'none') return new DOMMatrix();
		// Parent has a perspective — fall through to compute it properly.
		//@ts-ignore
		const pt = getElementPerspectiveTransform(actualElement, iframes);
		return pt != null ? pt : new DOMMatrix();
	}

	let m = new DOMMatrix();
	const origin = s.transformOrigin.split(' ');
	const originX = parseFloat(origin[0]);
	const originY = parseFloat(origin[1]);
	const originZ = origin[2] ? parseFloat(origin[2]) : 0;

	// FIX 11: Skip the origin wrap/unwrap entirely when origin is (0,0,0).
	//         Saves two DOMMatrix allocations and two multiply calls per element.
	const hasNonZeroOrigin = originX !== 0 || originY !== 0 || originZ !== 0;
	const mOri = hasNonZeroOrigin
		? new DOMMatrix().translateSelf(originX, originY, originZ)
		: null;

	if (hasTranslate) {
		let tr = s.translate;
		if (tr.includes('%')) {
			const v = tr.split(' ');
			const r = actualElement.getBoundingClientRect();
			if (v[0].endsWith('%')) v[0] = (parseFloat(v[0]) * r.width) / 100 + 'px';
			if (v[1]?.endsWith('%'))
				v[1] = (parseFloat(v[1]) * r.height) / 100 + 'px';
			tr = v.join(',');
		}
		m.multiplySelf(new DOMMatrix('translate(' + tr.replaceAll(' ', ',') + ')'));
	}
	if (hasRotate) {
		m.multiplySelf(
			new DOMMatrix('rotate(' + s.rotate.replaceAll(' ', ',') + ')'),
		);
	}
	if (hasScale) {
		m.multiplySelf(
			new DOMMatrix('scale(' + s.scale.replaceAll(' ', ',') + ')'),
		);
	}
	if (hasOffsetPath) {
		m.multiplySelf(computeOffsetTransformMatrix(element));
	}
	if (hasTransform) {
		m.multiplySelf(new DOMMatrix(s.transform));
	}

	// FIX 11 (continued): Only wrap with origin if non-zero.
	if (hasNonZeroOrigin) {
		m = mOri.multiply(m.multiplySelf(mOri.inverse()));
	}

	//@ts-ignore
	const pt = getElementPerspectiveTransform(element, iframes);
	if (pt != null) {
		m = pt.multiplySelf(m);
	}
	return m;
}
/**
 * project a DOM-Matrix to 2D (from firefox matrix.h)
 * @param {DOMMatrix} m
 */
function projectTo2D(m) {
	m.m31 = 0.0;
	m.m32 = 0.0;
	m.m13 = 0.0;
	m.m23 = 0.0;
	m.m33 = 1.0;
	m.m43 = 0.0;
	m.m34 = 0.0;
	// Some matrices, such as those derived from perspective transforms,
	// can modify _44 from 1, while leaving the rest of the fourth column
	// (_14, _24) at 0. In this case, after resetting the third row and
	// third column above, the value of _44 functions only to scale the
	// coordinate transform divide by W. The matrix can be converted to
	// a true 2D matrix by normalizing out the scaling effect of _44 on
	// the remaining components ahead of time.
	if (m.m14 == 0.0 && m.m24 == 0.0 && m.m44 != 1.0 && m.m44 != 0.0) {
		const scale = 1.0 / m.m44;
		m.m11 *= scale;
		m.m12 *= scale;
		m.m21 *= scale;
		m.m22 *= scale;
		m.m41 *= scale;
		m.m42 *= scale;
		m.m44 = 1.0;
	}
}
/**
 * @param {HTMLElement} element
 * @param {HTMLIFrameElement[]} iframes
 */
function getElementPerspectiveTransform(element, iframes) {
	/** @type { Element } */
	//@ts-ignore
	const perspectiveNode = getParentElementIncludingSlots(element, iframes);
	if (perspectiveNode) {
		//https://drafts.csswg.org/css-transforms-2/#perspective-matrix-computation
		let s = getCachedComputedStyle(perspectiveNode);
		if (s.perspective !== 'none') {
			let m = new DOMMatrix();
			let p = parseFloat(s.perspective);
			m.m34 = -1.0 / p;
			//https://drafts.csswg.org/css-transforms-2/#PerspectiveDefined
			if (s.perspectiveOrigin) {
				const origin = s.perspectiveOrigin.split(' ');
				const originX = parseFloat(origin[0]) - element.offsetLeft;
				const originY = parseFloat(origin[1]) - element.offsetTop;

				const mOri = new DOMMatrix().translateSelf(originX, originY);
				const mOriInv = new DOMMatrix().translateSelf(-originX, -originY);

				return mOri.multiplySelf(m.multiplySelf(mOriInv));
			}
		}
	}
	return null;
}

function computeOffsetTransformMatrix(elem) {
	const cs = getCachedComputedStyle(elem);

	const offsetPath = cs.offsetPath; // e.g. "path('M0,0 ...')"
	const offsetDistance = cs.offsetDistance; // e.g. "50%"
	const offsetRotate = cs.offsetRotate; // e.g. "auto", "45deg", "auto 30deg"
	const offsetAnchor = cs.offsetAnchor;
	const transformOrigin = cs.transformOrigin;

	// Parse offset-distance (px or %)
	let distance = parseOffsetDistance(offsetDistance);

	// Compute position & tangent on path (in containing block coordinates)
	let {x, y, angle} = computeOffsetPathPoint(elem, offsetPath, distance);

	// Subtract the element's flow position within its containing block.
	// The offset-path positions the element absolutely within the containing block,
	// but the walk already adds offsetLeft/offsetTop (flow position). To avoid
	// double-counting, make the offset relative to the flow position.
	const parent = elem.parentElement;
	if (
		parent instanceof HTMLElement ||
		parent instanceof (parent.ownerDocument.defaultView ?? window).HTMLElement
	) {
		if (elem.offsetParent === parent) {
			// Containing block = parent = offsetParent
			x -= elem.offsetLeft;
			y -= elem.offsetTop;
		} else if (elem.offsetParent === parent.offsetParent) {
			// Both share the same offsetParent
			x -= elem.offsetLeft - parent.offsetLeft;
			y -= elem.offsetTop - parent.offsetTop;
		}
	}

	// Handle offset-rotate
	let rotateFinal = 0;
	if (offsetRotate.startsWith('auto')) {
		let parts = offsetRotate.split(/\s+/);
		let extra = parts.length === 2 ? parseFloat(parts[1]) : 0;
		rotateFinal = angle + extra;
	} else {
		rotateFinal = parseFloat(offsetRotate);
	}

	const anchor = parseOffsetAnchor(offsetAnchor, transformOrigin, elem);

	const anchorMatrix = new DOMMatrix().translateSelf(-anchor.x, -anchor.y);

	let m = anchorMatrix.translate(x, y);
	m.multiplySelf(anchorMatrix.invertSelf());
	m.rotateSelf(rotateFinal);
	m.translateSelf(-anchor.x, -anchor.y);

	return m;
}

function parseOffsetAnchor(str, transformOrigin, elem) {
	const width = elem.offsetWidth;
	const height = elem.offsetHeight;

	if (!str || str === 'auto') {
		str = transformOrigin;
	}

	const parts = str.split(/\s+/);
	if (parts.length === 1) {
		// 1-value syntax = x only, y = center
		const x = parsePosition(parts[0], width);
		return {x, y: height / 2};
	}

	const x = parsePosition(parts[0], width);
	const y = parsePosition(parts[1], height);
	return {x, y};
}

function parsePosition(part, size) {
	part = part.trim();
	if (part.endsWith('%')) {
		return (parseFloat(part) / 100) * size;
	}
	if (part.endsWith('px')) {
		return parseFloat(part);
	}
	// keywords
	switch (part) {
		case 'left':
			return 0;
		case 'top':
			return 0;
		case 'center':
			return size / 2;
		case 'right':
			return size;
		case 'bottom':
			return size;
	}
	return parseFloat(part);
}

function parseOffsetDistance(str) {
	str = str.trim();
	if (str.endsWith('%')) {
		return parseFloat(str) / 100; // normalized (0..1)
	}
	return parseFloat(str); // px value if pathLength = 1
}

function parseAngle(str) {
	if (!str) return 0;
	str = str.trim();
	if (str.endsWith('deg')) return parseFloat(str);
	if (str.endsWith('rad')) return parseFloat(str) * (180 / Math.PI);
	if (str.endsWith('grad')) return parseFloat(str) * 0.9;
	return parseFloat(str);
}

function computeOffsetPathPoint(elem, offsetPath, distNorm) {
	if (!offsetPath || offsetPath === 'none') {
		return {x: 0, y: 0, angle: 0};
	}

	const value = offsetPath.trim();

	let m = value.match(/path\(["'](.+)["']\)/);
	if (m) return computePathType(m[1], distNorm);

	if (value.startsWith('circle(')) return computeCircle(value, distNorm);
	if (value.startsWith('ellipse(')) return computeEllipse(value, distNorm);
	if (value.startsWith('inset(')) return computeInset(value, elem, distNorm);
	if (value.startsWith('rect(')) return computeRect(value, distNorm);
	if (value.startsWith('xywh(')) return computeXYWH(value, distNorm);
	if (value.startsWith('ray(')) return computeRay(value, distNorm);
	if (value.startsWith('polygon(')) return computePolygon(value, distNorm);

	console.warn('Unsupported offset-path:', offsetPath);
	return {x: 0, y: 0, angle: 0};
}

function computePathType(pathData, distNorm) {
	let svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	svgPath.setAttribute('d', pathData);

	const total = svgPath.getTotalLength();
	const dist = distNorm <= 1 ? distNorm * total : distNorm;

	const p1 = svgPath.getPointAtLength(dist);
	const p2 = svgPath.getPointAtLength(Math.min(total, dist + 0.01));

	let angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

	return {x: p1.x, y: p1.y, angle};
}

function computeRay(str, t) {
	let m = str.match(/ray\(([^)]+)\)/);
	let inside = m[1].trim();

	// Split on "at" (optional)
	let [beforeAt, atPart] = inside.split('at').map((s) => s && s.trim());

	// angle
	let parts = beforeAt.split(/\s+/);
	let angleDeg = parseAngle(parts[0]);
	let angleRad = (angleDeg * Math.PI) / 180;

	// point of origin
	let ox = 0,
		oy = 0;
	if (atPart) {
		const pos = atPart.split(/\s+/);
		ox = parseFloat(pos[0]);
		oy = parseFloat(pos[1]);
	}

	// Ray: infinite line; offset-distance is distance along ray
	let dist = t <= 1 ? t : t; // percentage normalized already

	let x = ox + Math.cos(angleRad) * dist;
	let y = oy + Math.sin(angleRad) * dist;

	// tangent is ray direction
	return {x, y, angle: angleDeg};
}

function computeCircle(str, t) {
	let m = str.match(/circle\(([^)]+)\)/);
	let inner = m[1];

	let [radiusPart, atPart] = inner.split('at').map((s) => s.trim());
	let r = parseFloat(radiusPart);
	let [cx, cy] = atPart.split(/\s+/).map(parseFloat);

	let angleRad = t * 2 * Math.PI;
	let x = cx + Math.cos(angleRad) * r;
	let y = cy + Math.sin(angleRad) * r;

	let tangentAngleDeg = (angleRad * 180) / Math.PI + 90;

	return {x, y, angle: tangentAngleDeg};
}

function computeEllipse(str, t) {
	let m = str.match(/ellipse\(([^)]+)\)/);
	let parts = m[1].split('at');
	let radii = parts[0].trim().split(/\s+/).map(parseFloat);
	let center = parts[1].trim().split(/\s+/).map(parseFloat);

	let rx = radii[0];
	let ry = radii[1];
	let cx = center[0];
	let cy = center[1];

	let angleRad = t * 2 * Math.PI;

	let x = cx + Math.cos(angleRad) * rx;
	let y = cy + Math.sin(angleRad) * ry;

	// tangent direction derivative
	let dx = -Math.sin(angleRad) * rx;
	let dy = Math.cos(angleRad) * ry;
	let tangentAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

	return {x, y, angle: tangentAngleDeg};
}

function computeRect(str, t) {
	let m = str.match(/rect\(([^)]+)\)/);
	let nums = m[1].split(/\s+/).map((s) => parseFloat(s));
	let top = nums[0],
		right = nums[1],
		bottom = nums[2],
		left = nums[3];
	return rectPath(top, left, right, bottom, t);
}

function computeXYWH(str, t) {
	let m = str.match(/xywh\(([^)]+)\)/);
	let nums = m[1].split(/\s+/).map(parseFloat);

	let left = nums[0];
	let top = nums[1];
	let width = nums[2];
	let height = nums[3];

	return rectPath(top, left, left + width, top + height, t);
}

function computePolygon(str, t) {
	let m = str.match(/polygon\(([^)]+)\)/);
	let pairs = m[1].split(',').map((p) => p.trim().split(/\s+/).map(parseFloat));

	// Build cumulative lengths
	let pts = pairs;
	let lengths = [0];

	for (let i = 1; i < pts.length; i++) {
		let dx = pts[i][0] - pts[i - 1][0];
		let dy = pts[i][1] - pts[i - 1][1];
		lengths.push(Math.hypot(dx, dy) + lengths[i - 1]);
	}

	// close polygon
	let dx = pts[0][0] - pts[pts.length - 1][0];
	let dy = pts[0][1] - pts[pts.length - 1][1];
	lengths.push(Math.hypot(dx, dy) + lengths[lengths.length - 1]);

	let total = lengths[lengths.length - 1];
	let target = t * total;

	// find segment
	let i = lengths.findIndex((len) => len >= target);
	if (i <= 0) i = 1;

	let prevLen = lengths[i - 1];
	let nextLen = lengths[i];
	let segT = (target - prevLen) / (nextLen - prevLen);

	// segment points
	let a = pts[(i - 1) % pts.length];
	let b = pts[i % pts.length];

	let x = a[0] + (b[0] - a[0]) * segT;
	let y = a[1] + (b[1] - a[1]) * segT;

	let angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;

	return {x, y, angle};
}

function rectPath(top, left, right, bottom, t) {
	let w = right - left;
	let h = bottom - top;

	let perimeter = 2 * (w + h);
	let dist = t * perimeter;

	// go around edges
	if (dist < w) {
		// top edge
		let x = left + dist;
		return {x, y: top, angle: 0};
	}
	dist -= w;

	if (dist < h) {
		// right edge
		let y = top + dist;
		return {x: right, y, angle: 90};
	}
	dist -= h;

	if (dist < w) {
		// bottom edge
		let x = right - dist;
		return {x, y: bottom, angle: 180};
	}
	dist -= w;

	// left edge
	let y = bottom - dist;
	return {x: left, y, angle: 270};
}

// normalized inset uses calc
function tokenizeCalc(input) {
	let tokens = [];
	let i = 0;

	while (i < input.length) {
		let ch = input[i];

		if (/\s/.test(ch)) {
			i++;
			continue;
		}

		// operators & parentheses
		if ('+-*/()'.includes(ch)) {
			tokens.push({type: ch, value: ch});
			i++;
			continue;
		}

		// numbers or dimensions or %
		if (/[0-9.]/.test(ch)) {
			let start = i;
			while (/[0-9.]/.test(input[i])) i++;
			let num = input.slice(start, i);

			if (input[i] === '%') {
				i++;
				tokens.push({type: 'percentage', value: parseFloat(num)});
				continue;
			}

			// only px supported
			if (input.slice(i, i + 2) === 'px') {
				i += 2;
				tokens.push({type: 'dimension', value: parseFloat(num), unit: 'px'});
				continue;
			}

			// plain number
			tokens.push({type: 'number', value: parseFloat(num)});
			continue;
		}

		// function name (calc)
		if (/[a-zA-Z]/.test(ch)) {
			let start = i;
			while (/[a-zA-Z]/.test(input[i])) i++;
			let name = input.slice(start, i);

			if (name === 'calc' && input[i] === '(') {
				tokens.push({type: 'func', value: 'calc'});
				continue;
			}

			throw new Error('Unsupported function: ' + name);
		}

		throw new Error('Unexpected character in calc(): ' + ch);
	}

	return tokens;
}

// normalized inset uses calc
function parseCalc(tokens) {
	let i = 0;

	function peek() {
		return tokens[i];
	}
	function consume() {
		return tokens[i++];
	}

	function parseExpression() {
		let node = parseTerm();
		while (peek() && (peek().type === '+' || peek().type === '-')) {
			let op = consume().type;
			let right = parseTerm();
			node = {type: 'binary', op, left: node, right};
		}
		return node;
	}

	function parseTerm() {
		let node = parseFactor();
		while (peek() && (peek().type === '*' || peek().type === '/')) {
			let op = consume().type;
			let right = parseFactor();
			node = {type: 'binary', op, left: node, right};
		}
		return node;
	}

	function parseFactor() {
		let t = peek();
		if (!t) throw 'Unexpected end in calc()';

		if (t.type === 'number') {
			consume();
			return {type: 'number', value: t.value};
		}

		if (t.type === 'dimension') {
			consume();
			return {type: 'dimension', value: t.value, unit: t.unit};
		}

		if (t.type === 'percentage') {
			consume();
			return {type: 'percentage', value: t.value};
		}

		if (t.type === 'func') {
			consume(); // "calc"
			if (peek().type !== '(') throw "Expected '(' after calc";
			consume();
			let node = parseExpression();
			if (!peek() || peek().type !== ')') throw "Expected ')'";
			consume();
			return node;
		}

		if (t.type === '(') {
			consume();
			let node = parseExpression();
			if (!peek() || peek().type !== ')') throw "Expected ')'";
			consume();
			return node;
		}

		throw new Error('Unexpected calc token ' + JSON.stringify(t));
	}

	let ast = parseExpression();
	if (i !== tokens.length) throw 'Extra tokens after calc';
	return ast;
}

// normalized inset uses calc
function evalCalc(ast, env) {
	switch (ast.type) {
		case 'number':
			return ast.value;

		case 'dimension':
			return ast.value; // px only -> already a number

		case 'percentage':
			return env.percentBase * (ast.value / 100);

		case 'binary': {
			let l = evalCalc(ast.left, env);
			let r = evalCalc(ast.right, env);

			switch (ast.op) {
				case '+':
					return l + r;
				case '-':
					return l - r;
				case '*':
					return l * r;
				case '/':
					return l / r;
			}
		}
	}
	throw 'Invalid AST node ' + ast.type;
}

function resolveLength(expr, element, useHeight = false) {
	expr = expr.trim();

	// Fast path: pure px
	if (/^[0-9.]+px$/.test(expr)) return parseFloat(expr);

	let base = useHeight ? element.offsetHeight : element.offsetWidth;

	// Pure %
	if (/^[0-9.]+%$/.test(expr)) {
		let p = parseFloat(expr);
		return base * (p / 100);
	}

	// calc(...) or mixed values
	const ast = parseCalc(tokenizeCalc(expr));
	return evalCalc(ast, {
		percentBase: base,
	});
}

function parseInsetArgs(str) {
	let inside = str
		.trim()
		.replace(/^inset\s*\(/, '')
		.replace(/\)\s*$/, '');

	let args = [];
	let current = '';
	let depth = 0;

	for (let i = 0; i < inside.length; i++) {
		let ch = inside[i];

		if (ch === '(') {
			depth++;
			current += ch;
		} else if (ch === ')') {
			depth--;
			current += ch;
		} else if (/\s/.test(ch) && depth === 0) {
			if (current.trim() !== '') {
				args.push(current.trim());
				current = '';
			}
		} else {
			current += ch;
		}
	}

	if (current.trim() !== '') {
		args.push(current.trim());
	}

	return args;
}
/**
 *
 * @param {string} str
 * @param {HTMLElement} element
 * @param {number} progress
 * @returns
 */
function computeInset(str, element, progress) {
	const args = parseInsetArgs(str);
	if (args.length !== 4) throw new Error('inset() must have 4 arguments');

	const topPx = resolveLength(args[0], element, true);
	const rightPx = resolveLength(args[1], element, false);
	const bottomPx = resolveLength(args[2], element, true);
	const leftPx = resolveLength(args[3], element, false);

	const w = element.offsetWidth;
	const h = element.offsetHeight;

	// Actual rectangle coordinates
	const x1 = leftPx;
	const y1 = topPx;
	const x2 = w - rightPx;
	const y2 = h - bottomPx;

	// Rectangle perimeter
	const P = 2 * (x2 - x1 + (y2 - y1));

	let d = P * progress;

	// Walk the rectangle clockwise, return point
	// Top edge: (x1 -> x2, y1)
	let len = x2 - x1;
	if (d <= len) return {x: x1 + d, y: y1, angle: 0};
	d -= len;

	// Right edge: (x2, y1 -> y2)
	len = y2 - y1;
	if (d <= len) return {x: x2, y: y1 + d, angle: 90};
	d -= len;

	// Bottom edge: (x2 -> x1, y2)
	len = x2 - x1;
	if (d <= len) return {x: x2 - d, y: y2, angle: 180};
	d -= len;

	// Left edge: (x1, y2 -> y1)
	return {x: x1, y: y2 - d, angle: 270};
}

//Code from: https://github.com/floating-ui/floating-ui/blob/master/packages/utils/src/dom.ts

const transformProperties = [
	'transform',
	'translate',
	'scale',
	'rotate',
	'perspective',
];
const willChangeValues = [
	'transform',
	'translate',
	'scale',
	'rotate',
	'perspective',
	'filter',
];
const containValues = ['paint', 'layout', 'strict', 'content'];

function isElement(value) {
	const elType = value?.ownerDocument?.defaultView?.Element;
	return (
		value instanceof Element || (elType != null && value instanceof elType)
	);
}
/**
 *
 * @param {CSSStyleDeclaration} css
 * @returns {boolean}
 */
function isContainingBlock(css) {
	// https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
	// https://drafts.csswg.org/css-transforms-2/#individual-transforms
	return (
		transformProperties.some((value) =>
			css[value] ? css[value] !== 'none' : false,
		) ||
		(css.containerType ? css.containerType !== 'normal' : false) ||
		(css.backdropFilter ? css.backdropFilter !== 'none' : false) ||
		(css.filter ? css.filter !== 'none' : false) ||
		willChangeValues.some((value) => (css.willChange || '').includes(value)) ||
		containValues.some((value) => (css.contain || '').includes(value))
	);
}

//Code from: https://github.com/jcfranco/composed-offset-position/blob/main/src/index.ts
function flatTreeParent(element) {
	if (element.assignedSlot) return element.assignedSlot;
	if (element.parentNode instanceof ShadowRoot) return element.parentNode.host;
	return element.parentNode;
}

function isFlatTreeInclusiveAncestor(ancestor, node) {
	for (let current = node; current; current = flatTreeParent(current)) {
		if (current === ancestor) return true;
	}
	return false;
}

function ancestorTreeScopes(element) {
	const scopes = new Set();
	let currentScope = element.getRootNode();
	const shadowRootCtor =
		element.ownerDocument?.defaultView?.ShadowRoot ?? ShadowRoot;
	while (currentScope) {
		scopes.add(currentScope);
		if (currentScope instanceof shadowRootCtor) {
			currentScope = currentScope.host?.getRootNode() ?? null;
		} else {
			currentScope = currentScope.parentNode
				? currentScope.parentNode.getRootNode()
				: null;
		}
	}

	return scopes;
}

function offsetParentPolyfill(element) {
	// Do an initial walk to check for display:none ancestors.
	for (let ancestor = element; ancestor; ancestor = flatTreeParent(ancestor)) {
		if (!(ancestor instanceof Element)) continue;
		if (getCachedComputedStyle(ancestor).display === 'none') return null;
	}

	for (
		let ancestor = flatTreeParent(element);
		ancestor;
		ancestor = flatTreeParent(ancestor)
	) {
		if (!(ancestor instanceof Element)) continue;
		const style = getCachedComputedStyle(ancestor);
		if (style.display === 'contents') continue;
		if (style.position !== 'static' || isContainingBlock(style))
			return ancestor;
		if (ancestor.tagName === 'BODY') return ancestor;
	}
	return null;
}
/**
 *
 * @param {*} element
 * @param {'offsetTop' | 'offsetLeft'} offsetTopOrLeft
 * @returns
 */
function offsetTopLeftPolyfill(element, offsetTopOrLeft) {
	let value = element[offsetTopOrLeft];
	let nextOffsetParent = offsetParentPolyfill(element);
	const scopes = ancestorTreeScopes(element);

	while (nextOffsetParent && !scopes.has(nextOffsetParent.getRootNode())) {
		value -= nextOffsetParent[offsetTopOrLeft];
		nextOffsetParent = offsetParentPolyfill(nextOffsetParent);
	}

	return value;
}
/**
 * @param {Element} element
 * @returns {boolean}
 */
function createsFixedContainingBlock(element) {
	const cs = getCachedComputedStyle(element);
	if (
		(cs.transform && cs.transform !== 'none') ||
		(cs.perspective && cs.perspective !== 'none') ||
		(cs.filter && cs.filter !== 'none') ||
		(cs.backdropFilter && cs.backdropFilter !== 'none')
	) {
		return true;
	}

	const contain = cs.contain || '';
	if (
		contain.includes('paint') ||
		contain.includes('layout') ||
		contain.includes('strict') ||
		contain.includes('content')
	) {
		return true;
	}

	const willChange = cs.willChange || '';
	return /transform|perspective|filter|backdrop-filter/.test(willChange);
}
/**
 * @param {HTMLElement} element
 * @param {HTMLIFrameElement[]=} iframes
 * @returns {Element | null}
 */
function getNearestFixedContainingBlock(element, iframes) {
	let parent = getParentElementIncludingSlots(element, iframes);
	while (parent) {
		if (createsFixedContainingBlock(parent)) return parent;
		parent = getParentElementIncludingSlots(parent, iframes);
	}
	return null;
}
